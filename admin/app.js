// app.js - 管理后台逻辑

// 配置
const REPO_OWNER = 'wangshuang12138-beep';
const REPO_NAME = 'music-daily';
const STORY_REPO = 'story';

let currentData = {
  chapters: [],
  music: [],
  storyContent: {}
};

let currentEditDay = null;

// 切换标签页
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(tab + 'Panel').classList.add('active');
  
  if (tab === 'music' && currentEditDay) {
    loadMusicForDay(currentEditDay);
  }
}

// 加载数据
async function loadData() {
  try {
    // 加载章节列表
    const chaptersRes = await fetch(`https://${REPO_OWNER}.github.io/${STORY_REPO}/chapters.json`);
    const chaptersData = await chaptersRes.json();
    currentData.chapters = chaptersData.chapters;
    
    // 加载音乐数据
    const musicRes = await fetch(`https://${REPO_OWNER}.github.io/${REPO_NAME}/data.json`);
    const musicData = await musicRes.json();
    currentData.music = musicData.days || [];
    
    renderDayList();
  } catch (e) {
    showMessage('加载数据失败: ' + e.message, 'error');
  }
}

// 渲染日记列表
function renderDayList() {
  const container = document.getElementById('dayList');
  const maxDay = Math.max(...currentData.chapters.map(c => c.day), 0);
  
  let html = '';
  
  // 显示已有章节
  for (let i = 1; i <= Math.max(maxDay, 11); i++) {
    const chapter = currentData.chapters.find(c => c.day === i);
    const music = currentData.music.find(m => m.day === i);
    
    const date = chapter?.date || calculateDate(i);
    const status = chapter ? 'published' : 'draft';
    const statusText = chapter ? '已发布' : '草稿';
    const title = chapter?.title || `Day ${i}`;
    
    html += `
      <div class="day-card" onclick="editDay(${i})">
        <div class="day-num">${i}</div>
        <div class="day-date">${date}</div>
        <div class="day-status ${status}">${statusText}</div>
        ${music ? '<div style="margin-top:5px;font-size:11px;color:#666;">🎵 ' + music.song?.title + '</div>' : ''}
      </div>
    `;
  }
  
  // 添加新日记按钮
  html += `
    <div class="day-card" onclick="createNewDay()" style="border-style: dashed;">
      <div class="day-num" style="color: #999;">+</div>
      <div class="day-date">新建日记</div>
    </div>
  `;
  
  container.innerHTML = html;
}

// 计算日期
function calculateDate(dayNum) {
  // Day 1 = 2026-03-16
  const baseDate = new Date('2026-03-16');
  const targetDate = new Date(baseDate);
  targetDate.setDate(baseDate.getDate() + dayNum - 1);
  return targetDate.toISOString().split('T')[0];
}

// 编辑日记
async function editDay(day) {
  currentEditDay = day;
  
  const chapter = currentData.chapters.find(c => c.day === day);
  const music = currentData.music.find(m => m.day === day);
  
  // 显示编辑器
  document.getElementById('dayList').style.display = 'none';
  document.getElementById('dayEditor').style.display = 'block';
  
  document.getElementById('editDayNum').textContent = day;
  document.getElementById('editDate').value = chapter?.date || calculateDate(day);
  document.getElementById('editTitle').value = chapter?.title || '';
  
  // 加载故事内容
  try {
    const storyRes = await fetch(`https://${REPO_OWNER}.github.io/${STORY_REPO}/story.md`);
    const storyText = await storyRes.text();
    const dayContent = extractDayContent(storyText, day);
    document.getElementById('editContent').value = dayContent || generateDayTemplate(day);
  } catch (e) {
    document.getElementById('editContent').value = generateDayTemplate(day);
  }
  
  // 同步更新音乐编辑器
  document.getElementById('musicDayNum').textContent = day;
  if (music) {
    document.getElementById('musicTitle').value = music.song?.title || '';
    document.getElementById('musicArtist').value = music.song?.artist || '';
    document.getElementById('musicQuote').value = music.song?.quote || '';
    document.getElementById('musicUrl').value = music.audioUrl || '';
  } else {
    document.getElementById('musicTitle').value = '';
    document.getElementById('musicArtist').value = '';
    document.getElementById('musicQuote').value = '';
    document.getElementById('musicUrl').value = `https://${REPO_OWNER}.github.io/assets/music/${calculateDate(day).replace(/-/g, '-')}.mp3`;
  }
}

// 创建新日记
function createNewDay() {
  const maxDay = Math.max(...currentData.chapters.map(c => c.day), 0);
  editDay(maxDay + 1);
}

// 取消编辑
function cancelEdit() {
  document.getElementById('dayList').style.display = 'grid';
  document.getElementById('dayEditor').style.display = 'none';
  currentEditDay = null;
}

// 提取某一天的内容
function extractDayContent(storyText, day) {
  const regex = new RegExp(`## Day ${day}\\s*\\n([\\s\\S]*?)(?=\\n## Day \\d+|\\n---|$)`);
  const match = storyText.match(regex);
  return match ? match[1].trim() : '';
}

// 生成日记模板
function generateDayTemplate(day) {
  const date = calculateDate(day);
  return `## Day ${day}

早上醒来的时候，______。

${date}，星期__，深圳，__，__度。

这是裸辞的第__天。

（在这里继续写故事...）

---

裸辞的第__天，我在______听了一首歌。
`;
}

// 保存日记
async function saveDay() {
  if (!currentEditDay) return;
  
  const date = document.getElementById('editDate').value;
  const title = document.getElementById('editTitle').value.trim();
  const content = document.getElementById('editContent').value.trim();
  
  if (!date || !title || !content) {
    showMessage('请填写完整信息', 'error');
    return;
  }
  
  // 生成需要更新的文件内容
  const dayData = {
    day: currentEditDay,
    date,
    title,
    content
  };
  
  // 显示导出窗口（因为无法直接写 GitHub，先展示 JSON）
  showExportDialog(dayData);
}

// 保存音乐配置
async function saveMusic() {
  if (!currentEditDay) return;
  
  const musicData = {
    day: currentEditDay,
    date: calculateDate(currentEditDay),
    song: {
      title: document.getElementById('musicTitle').value.trim(),
      artist: document.getElementById('musicArtist').value.trim(),
      quote: document.getElementById('musicQuote').value.trim()
    },
    audioUrl: document.getElementById('musicUrl').value.trim()
  };
  
  showExportDialog(musicData, 'music');
}

// 显示导出对话框
function showExportDialog(data, type = 'story') {
  const json = JSON.stringify(data, null, 2);
  
  const dialog = document.createElement('div');
  dialog.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  dialog.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow: auto;
    ">
      <h3>📋 ${type === 'story' ? '故事' : '音乐'}数据已生成</h3>
      <p style="color: #666; margin: 15px 0;">
        由于浏览器安全限制，无法直接修改代码仓库。
        请复制以下 JSON 数据，然后手动更新到对应文件：
      </p>
      <pre style="
        background: #f5f5f5;
        padding: 15px;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 12px;
        margin: 15px 0;
      ">${json.replace(/</g, '&lt;')}</pre>
      <div style="margin-top: 20px;">
        <button class="btn btn-primary" onclick="copyToClipboard('${json.replace(/'/g, "\\'")}')">📋 复制 JSON</button>
        <button class="btn btn-secondary" onclick="this.closest('.dialog').remove()">关闭</button>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 15px;">
        💡 提示：后续可以配置 GitHub Token 来自动提交
      </p>
    </div>
  `;
  
  dialog.className = 'dialog';
  document.body.appendChild(dialog);
}

// 复制到剪贴板
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showMessage('已复制到剪贴板', 'success');
  });
}

// 显示消息
function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.className = 'message ' + type;
  
  setTimeout(() => {
    msg.className = 'message';
  }, 3000);
}

// 加载某天的音乐
function loadMusicForDay(day) {
  const music = currentData.music.find(m => m.day === day);
  document.getElementById('musicDayNum').textContent = day;
  
  if (music) {
    document.getElementById('musicTitle').value = music.song?.title || '';
    document.getElementById('musicArtist').value = music.song?.artist || '';
    document.getElementById('musicQuote').value = music.song?.quote || '';
    document.getElementById('musicUrl').value = music.audioUrl || '';
  }
}
