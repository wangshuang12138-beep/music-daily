// app.js - 管理后台逻辑

console.log('[App] 脚本加载中...');

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

// 全局暴露函数
window.switchTab = function(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  
  const tabs = document.querySelectorAll('.tab');
  if (tab === 'days') tabs[0]?.classList.add('active');
  if (tab === 'music') tabs[1]?.classList.add('active');
  
  document.getElementById(tab + 'Panel').classList.add('active');
  
  if (tab === 'music' && currentEditDay) {
    loadMusicForDay(currentEditDay);
  }
};

window.editDay = async function(day) {
  console.log('[App] 编辑 Day', day);
  currentEditDay = day;
  
  const chapter = currentData.chapters.find(c => c.day === day);
  const music = currentData.music.find(m => m.day === day);
  
  document.getElementById('dayList').style.display = 'none';
  document.getElementById('dayEditor').style.display = 'block';
  
  document.getElementById('editDayNum').textContent = day;
  document.getElementById('editDate').value = chapter?.date || calculateDate(day);
  document.getElementById('editTitle').value = chapter?.title || '';
  
  // 从 GitHub 获取真实的故事内容
  let storyContent = '';
  try {
    const storyRes = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${STORY_REPO}/main/story.md`);
    if (storyRes.ok) {
      const storyText = await storyRes.text();
      storyContent = extractDayContent(storyText, day);
    }
  } catch (e) {
    console.log('[App] 获取故事内容失败:', e);
  }
  
  // 如果有真实内容则显示，否则显示模板
  document.getElementById('editContent').value = storyContent || generateDayTemplate(day);
  
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
    document.getElementById('musicUrl').value = `https://${REPO_OWNER}.github.io/assets/music/${calculateDate(day)}.mp3`;
  }
};

window.createNewDay = function() {
  const maxDay = Math.max(...currentData.chapters.map(c => c.day), 0);
  window.editDay(maxDay + 1);
};

window.cancelEdit = function() {
  document.getElementById('dayList').style.display = 'grid';
  document.getElementById('dayEditor').style.display = 'none';
  currentEditDay = null;
};

window.saveDay = function() {
  if (!currentEditDay) return;
  
  const date = document.getElementById('editDate').value;
  const title = document.getElementById('editTitle').value.trim();
  const content = document.getElementById('editContent').value.trim();
  
  if (!date || !title || !content) {
    showMessage('请填写完整信息', 'error');
    return;
  }
  
  const dayData = {
    day: currentEditDay,
    date,
    title,
    content
  };
  
  showExportDialog(dayData, 'story');
};

window.saveMusic = function() {
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
};

window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showMessage('已复制到剪贴板', 'success');
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showMessage('已复制到剪贴板', 'success');
  });
};

// 内部函数
async function loadData() {
  console.log('[App] 加载数据中...');
  try {
    const chaptersRes = await fetch(`https://${REPO_OWNER}.github.io/${STORY_REPO}/chapters.json`);
    const chaptersData = await chaptersRes.json();
    currentData.chapters = chaptersData.chapters || [];
    
    const musicRes = await fetch(`https://${REPO_OWNER}.github.io/${REPO_NAME}/data.json`);
    const musicData = await musicRes.json();
    currentData.music = musicData.days || [];
    
    renderDayList();
    console.log('[App] 数据加载完成');
  } catch (e) {
    console.error('[App] 加载数据失败:', e);
    showMessage('加载数据失败: ' + e.message, 'error');
  }
}

function renderDayList() {
  const container = document.getElementById('dayList');
  const maxDay = Math.max(...currentData.chapters.map(c => c.day), 0);
  
  let html = '';
  
  for (let i = 1; i <= Math.max(maxDay, 11); i++) {
    const chapter = currentData.chapters.find(c => c.day === i);
    const music = currentData.music.find(m => m.day === i);
    
    const date = chapter?.date || calculateDate(i);
    const status = chapter ? 'published' : 'draft';
    const statusText = chapter ? '已发布' : '草稿';
    
    html += `
      <div class="day-card" onclick="editDay(${i})">
        <div class="day-num">${i}</div>
        <div class="day-date">${date}</div>
        <div class="day-status ${status}">${statusText}</div>
        ${music ? '<div style="margin-top:5px;font-size:11px;color:#666;">🎵 ' + (music.song?.title || '') + '</div>' : ''}
      </div>
    `;
  }
  
  html += `
    <div class="day-card" onclick="createNewDay()" style="border-style: dashed;">
      <div class="day-num" style="color: #999;">+</div>
      <div class="day-date">新建日记</div>
    </div>
  `;
  
  container.innerHTML = html;
}

function calculateDate(dayNum) {
  const baseDate = new Date('2026-03-16');
  const targetDate = new Date(baseDate);
  targetDate.setDate(baseDate.getDate() + dayNum - 1);
  return targetDate.toISOString().split('T')[0];
}

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

// 从 story.md 中提取某天的内容
function extractDayContent(storyText, day) {
  // 匹配 ## Day X 开头的内容，直到下一个 ## Day 或文件结束
  const regex = new RegExp(`## Day ${day}\\s*\\n([\\s\\S]*?)(?=\\n## Day \\d+|\\n---\\s*$|$)`);
  const match = storyText.match(regex);
  return match ? match[1].trim() : '';
}
}

function showExportDialog(data, type) {
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
  
  const escapedJson = json.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  
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
      <pre id="exportJson" style="
        background: #f5f5f5;
        padding: 15px;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 12px;
        margin: 15px 0;
      ">${json.replace(/</g, '&lt;')}</pre>
      <div style="margin-top: 20px;">
        <button class="btn btn-primary" onclick="doCopy()">📋 复制 JSON</button>
        <button class="btn btn-secondary" onclick="this.closest('.dialog').remove()">关闭</button>
      </div>
    </div>
  `;
  
  dialog.className = 'dialog';
  document.body.appendChild(dialog);
  
  window.doCopy = function() {
    const text = document.getElementById('exportJson').textContent;
    window.copyToClipboard(text);
  };
}

function showMessage(text, type) {
  const msg = document.getElementById('message');
  if (!msg) return;
  msg.textContent = text;
  msg.className = 'message ' + type;
  
  setTimeout(() => {
    msg.className = 'message';
  }, 3000);
}

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

// 暴露 loadData 给 auth.js
window.loadData = loadData;

// 文件上传相关变量
let selectedFile = null;
let fileBase64 = null;

// 处理文件选择
window.handleFileSelect = function(event) {
  const file = event.target.files[0];
  if (file) processFile(file);
};

// 处理拖拽
window.handleDrop = function(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) processFile(file);
};

// 处理文件
function processFile(file) {
  if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3')) {
    alert('请选择音频文件（MP3格式）');
    return;
  }
  
  selectedFile = file;
  
  // 显示文件信息
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = formatFileSize(file.size);
  document.getElementById('fileInfo').style.display = 'block';
  
  // 读取为 base64
  const reader = new FileReader();
  reader.onload = function(e) {
    fileBase64 = e.target.result.split(',')[1]; // 去掉 data:audio/mp3;base64, 前缀
    
    // 设置音频预览
    document.getElementById('audioPreview').src = e.target.result;
    
    // 尝试获取音频时长
    const audio = new Audio(e.target.result);
    audio.onloadedmetadata = function() {
      const duration = formatDuration(audio.duration);
      document.getElementById('fileDuration').textContent = '时长: ' + duration;
    };
  };
  reader.readAsDataURL(file);
}

// 清除文件
window.clearFile = function() {
  selectedFile = null;
  fileBase64 = null;
  document.getElementById('fileInput').value = '';
  document.getElementById('fileInfo').style.display = 'none';
  document.getElementById('audioPreview').src = '';
};

// 生成上传数据
window.generateUploadData = function() {
  if (!selectedFile || !fileBase64) {
    alert('请先选择文件');
    return;
  }
  
  if (!currentEditDay) {
    alert('请先选择要上传的 Day');
    return;
  }
  
  const date = calculateDate(currentEditDay);
  const filename = `${date}.mp3`;
  
  const uploadData = {
    filename: filename,
    day: currentEditDay,
    date: date,
    size: selectedFile.size,
    base64: fileBase64.substring(0, 100) + '... (共 ' + fileBase64.length + ' 字符)'
  };
  
  // 显示上传指引对话框
  showUploadDialog(filename, fileBase64);
};

// 显示上传对话框
function showUploadDialog(filename, base64Content) {
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
  
  const date = calculateDate(currentEditDay);
  const githubUrl = `https://github.com/${REPO_OWNER}/assets/upload/main/music/`;
  
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
      <h3>🎵 音乐文件上传指引</h3>
      
      <div style="background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 15px 0; font-size: 14px;">
        <strong>目标文件名：</strong> ${filename}<br>
        <strong>对应 Day：</strong> Day ${currentEditDay} (${date})<br>
        <strong>文件大小：</strong> ${formatFileSize(selectedFile.size)}
      </div>
      
      <p style="color: #666; font-size: 14px; margin: 15px 0;">
        由于浏览器安全限制，无法直接上传到 GitHub。请按以下步骤操作：
      </p>
      
      <ol style="color: #666; font-size: 14px; line-height: 2;">
        <li>点击下方「打开 GitHub 上传页面」</li>
        <li>文件名填写：<code>${filename}</code></li>
        <li>将本地文件拖拽到页面，或点击选择文件</li>
        <li>填写提交信息，如：「Add Day ${currentEditDay} music」</li>
        <li>点击「Commit changes」</li>
      </ol>
      
      <div style="margin-top: 20px;">
        <a href="${githubUrl}" target="_blank" class="btn btn-primary" style="text-decoration: none; display: inline-block;">
          🔗 打开 GitHub 上传页面
        </a>
        <button class="btn btn-secondary" onclick="this.closest('.dialog').remove()">关闭</button>
      </div>
      
      <div style="margin-top: 15px; padding: 10px; background: #fff3e0; border-radius: 4px; font-size: 12px; color: #e65100;">
        💡 提示：上传完成后，音乐文件的 URL 将自动变为：<br>
        <code>https://${REPO_OWNER}.github.io/assets/music/${filename}</code>
      </div>
    </div>
  `;
  
  dialog.className = 'dialog';
  document.body.appendChild(dialog);
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化时长
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ':' + secs.toString().padStart(2, '0');
}

console.log('[App] 脚本加载完成');
