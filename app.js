// xca's 音乐故事日记
// 从 story 仓库加载故事内容

const STORY_BASE_URL = 'https://wangshuang12138-beep.github.io/story';
const ASSETS_BASE_URL = 'https://wangshuang12138-beep.github.io/assets';

// 缓存清除参数 - 每次更新时修改
const CACHE_BUSTER = '?v=20250318-3';

let storyData = null;
let musicData = null;
let currentDay = 1;
let maxDay = 1;

// 初始化
async function init() {
  try {
    // 并行加载故事和音乐数据
    await Promise.all([
      loadStoryData(),
      loadMusicData()
    ]);
    
    // 确定当前天数
    const today = new Date();
    const todayStr = formatDate(today);
    
    // 查找今天对应的故事
    const todayChapter = storyData.chapters?.find(c => c.date === todayStr);
    if (todayChapter) {
      currentDay = todayChapter.day;
    } else {
      // 如果没有今天的故事，显示最新的一天
      currentDay = maxDay;
    }
    
    renderDay(currentDay);
  } catch (error) {
    console.error('初始化失败:', error);
    showError('加载失败，请稍后重试');
  }
}

// 加载故事数据
async function loadStoryData() {
  // 加载章节索引
  const chaptersRes = await fetch(`${STORY_BASE_URL}/chapters.json${CACHE_BUSTER}`);
  const chaptersData = await chaptersRes.json();
  
  // 加载完整故事
  const storyRes = await fetch(`${STORY_BASE_URL}/story.md${CACHE_BUSTER}`);
  const storyText = await storyRes.text();
  
  // 解析故事章节
  const chapters = parseStory(storyText);
  
  storyData = {
    chapters: chaptersData.chapters,
    content: chapters
  };
  
  // 计算最大天数
  maxDay = Math.max(...chaptersData.chapters.map(c => c.day), 1);
}

// 加载音乐数据
async function loadMusicData() {
  const response = await fetch(`https://raw.githubusercontent.com/wangshuang12138-beep/music-daily/main/data.json${CACHE_BUSTER}`);
  musicData = await response.json();
}

// 解析故事 markdown
function parseStory(text) {
  const chapters = {};
  const dayRegex = /## Day (\d+)\s*\n([\s\S]*?)(?=\n## Day \d+|\n---|\s*$)/g;
  
  let match;
  while ((match = dayRegex.exec(text)) !== null) {
    const day = parseInt(match[1]);
    const content = match[2].trim();
    chapters[day] = content;
  }
  
  return chapters;
}

// 渲染某一天
function renderDay(day) {
  currentDay = day;
  
  const container = document.getElementById('content');
  const chapter = storyData.chapters?.find(c => c.day === day);
  const storyContent = storyData.content[day];
  const music = musicData.days?.find(d => d.day === day);
  
  if (!storyContent || !chapter) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Day ${day} 尚未发布</h2>
        <p>故事还在写作中，敬请期待... </p>
      </div>
    `;
    updateNav();
    return;
  }
  
  // 解析故事内容为段落
  const paragraphs = storyContent.split('\n\n').filter(p => p.trim());
  const storyHtml = paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
  
  // 生成日期显示
  const dateObj = new Date(chapter.date);
  const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  const weekStr = ['日', '一', '二', '三', '四', '五', '六'][dateObj.getDay()];
  
  container.innerHTML = `
    <article class="diary-card">
      <header class="diary-header">
        <div class="diary-date">${dateStr} 周${weekStr}</div>
        <div class="diary-day">Day ${day} · ${chapter.title || '未命名'}</div>
      </header>
      
      <div class="diary-content">
        ${storyHtml}
      </div>
      
      <footer class="diary-footer">
        <span class="signature">xca</span>
        <div class="logo-mark" title="xca's pick">
          <img src="${ASSETS_BASE_URL}/logo-xca-square.svg" alt="xca">
        </div>
      </footer>
    </article>
    
    ${music ? `
    <div class="music-card">
      <div class="music-header">
        <span>🎵</span>
        <span>今日 soundtrack</span>
      </div>
      
      <div class="song-info">
        <div class="song-title">${escapeHtml(music.song.title)}</div>
        <div class="song-artist">${escapeHtml(music.song.artist)}</div>
      </div>
      
      <div class="audio-player">
        <audio controls preload="metadata">
          <source src="${music.audioUrl}" type="audio/mpeg">
          <p>您的浏览器不支持音频播放</p>
        </audio>
      </div>
      
      <blockquote class="quote">
        ${escapeHtml(music.song.quote)}
      </blockquote>
    </div>
    ` : ''}
  `;
  
  updateNav();
}

// 更新导航
function updateNav() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const navCurrent = document.getElementById('navCurrent');
  
  prevBtn.disabled = currentDay <= 1;
  nextBtn.disabled = currentDay >= maxDay;
  
  navCurrent.textContent = `Day ${currentDay}`;
}

// 绑定导航事件
document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentDay > 1) {
    renderDay(currentDay - 1);
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentDay < maxDay) {
    renderDay(currentDay + 1);
  }
});

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// HTML 转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 显示错误
function showError(message) {
  document.getElementById('content').innerHTML = `
    <div class="empty-state">
      <h2>出错了</h2>
      <p>${message}</p>
    </div>
  `;
}

// 启动
init();
/* Updated: Mon Mar 16 07:37:34 PM CST 2026 */
