// xca's 音乐故事日记
// 方案B：交互触发播放，音乐在故事上方

const STORY_BASE_URL = 'https://wangshuang12138-beep.github.io/story';
const ASSETS_BASE_URL = 'https://wangshuang12138-beep.github.io/assets';

// 缓存清除参数
const CACHE_BUSTER = '?v=20250320-1';

let storyData = null;
let musicData = null;
let currentDay = 1;
let maxDay = 1;
let currentAudio = null;
let isPlaying = false;

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
    
    const todayChapter = storyData.chapters?.find(c => c.date === todayStr);
    if (todayChapter) {
      currentDay = todayChapter.day;
    } else {
      currentDay = maxDay;
    }
    
    // 方案B：先显示欢迎页，不直接显示故事
    renderWelcome(currentDay);
  } catch (error) {
    console.error('初始化失败:', error);
    showError('加载失败，请稍后重试');
  }
}

// 加载故事数据
async function loadStoryData() {
  const chaptersRes = await fetch(`${STORY_BASE_URL}/chapters.json${CACHE_BUSTER}`);
  const chaptersData = await chaptersRes.json();
  
  const storyRes = await fetch(`${STORY_BASE_URL}/story.md${CACHE_BUSTER}`);
  const storyText = await storyRes.text();
  
  const chapters = parseStory(storyText);
  
  storyData = {
    chapters: chaptersData.chapters,
    content: chapters
  };
  
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

// 方案B：渲染欢迎页（播放按钮在上方）
function renderWelcome(day) {
  currentDay = day;
  const container = document.getElementById('content');
  const chapter = storyData.chapters?.find(c => c.day === day);
  const music = musicData.days?.find(d => d.day === day);
  
  if (!chapter) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>Day ${day} 尚未发布</h2>
        <p>故事还在写作中，敬请期待...</p>
      </div>
    `;
    updateNav();
    return;
  }
  
  // 生成日期
  const dateObj = new Date(chapter.date);
  const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  const weekStr = ['日', '一', '二', '三', '四', '五', '六'][dateObj.getDay()];
  
  // 方案B：先显示音乐和开始按钮
  container.innerHTML = `
    <div class="welcome-card">
      <div class="welcome-header">
        <div class="welcome-date">${dateStr} 周${weekStr}</div>
        <div class="welcome-day">Day ${day}</div>
        <h2 class="welcome-title">${escapeHtml(chapter.title || '未命名')}</h2>
      </div>
      
      ${music ? `
      <div class="music-intro">
        <div class="music-intro-header">
          <span class="music-icon">🎵</span>
          <span>今日 Soundtrack</span>
        </div>
        
        <div class="song-preview">
          <div class="song-preview-title">${escapeHtml(music.song.title)}</div>
          <div class="song-preview-artist">${escapeHtml(music.song.artist)}</div>
          <blockquote class="quote-preview">${escapeHtml(music.song.quote)}</blockquote>
        </div>
        
        <!-- 音频对象（初始隐藏） -->
        <audio id="bgMusic" preload="auto" loop>
          <source src="${music.audioUrl}" type="audio/mpeg">
        </audio>
        
        <!-- 方案B：开始阅读按钮 -->
        <button class="start-reading-btn" onclick="startReading()">
          <span class="btn-icon">▶</span>
          <span class="btn-text">开始阅读</span>
          <span class="btn-hint">点击播放音乐并展开故事</span>
        </button>
      </div>
      ` : ''}
    </div>
  `;
  
  updateNav();
}

// 方案B：点击开始阅读后，显示故事并播放音乐
window.startReading = function() {
  const container = document.getElementById('content');
  const chapter = storyData.chapters?.find(c => c.day === currentDay);
  const music = musicData.days?.find(d => d.day === currentDay);
  const storyContent = storyData.content[currentDay];
  
  if (!storyContent || !chapter) return;
  
  // 生成日期
  const dateObj = new Date(chapter.date);
  const dateStr = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  const weekStr = ['日', '一', '二', '三', '四', '五', '六'][dateObj.getDay()];
  
  // 解析故事内容为段落
  const paragraphs = storyContent.split('\n\n').filter(p => p.trim());
  const storyHtml = paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('');
  
  // 显示完整内容（音乐播放器在上方）
  container.innerHTML = `
    ${music ? `
    <!-- 音乐播放器 - 放在故事上方 -->
    <div class="music-card">
      <div class="music-header">
        <span class="music-icon">🎵</span>
        <span>正在播放</span>
      </div>
      
      <div class="song-info">
        <div class="song-title">${escapeHtml(music.song.title)}</div>
        <div class="song-artist">${escapeHtml(music.song.artist)}</div>
      </div>
      
      <div class="audio-controls">
        <button class="control-btn" id="playPauseBtn" onclick="togglePlay()">
          <span id="playPauseIcon">⏸</span>
        </button>
        
        <div class="progress-container">
          <div class="progress-bar" id="progressBar">
            <div class="progress-fill" id="progressFill"></div>
          </div>
          <div class="time-display">
            <span id="currentTime">0:00</span>
            <span id="duration">--:--</span>
          </div>
        </div>
        
        <div class="volume-control">
          <span class="volume-icon">🔊</span>
          <input type="range" class="volume-slider" id="volumeSlider" 
                 min="0" max="1" step="0.1" value="0.7" 
                 onchange="setVolume(this.value)">
        </div>
      </div>
      
      <blockquote class="quote">${escapeHtml(music.song.quote)}</blockquote>
      
      <!-- 隐藏的音频元素 -->
      <audio id="bgMusic" preload="auto" loop>
        <source src="${music.audioUrl}" type="audio/mpeg">
      </audio>
    </div>
    ` : ''}
    
    <!-- 故事内容 -->
    <article class="diary-card">
      <header class="diary-header">
        <div class="diary-date">${dateStr} 周${weekStr}</div>
        <div class="diary-day">Day ${currentDay} · ${chapter.title || '未命名'}</div>
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
  `;
  
  // 自动播放音乐
  const audio = document.getElementById('bgMusic');
  if (audio) {
    currentAudio = audio;
    audio.volume = 0.7;
    
    // 尝试播放
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isPlaying = true;
        updatePlayButton();
        setupAudioEvents();
      }).catch(error => {
        console.log('自动播放被阻止:', error);
        isPlaying = false;
        updatePlayButton();
      });
    }
  }
  
  // 滚动到音乐区域
  const musicCard = document.querySelector('.music-card');
  if (musicCard) {
    musicCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

// 音频控制函数
window.togglePlay = function() {
  if (!currentAudio) {
    const audio = document.getElementById('bgMusic');
    if (audio) currentAudio = audio;
  }
  
  if (currentAudio) {
    if (currentAudio.paused) {
      currentAudio.play();
      isPlaying = true;
    } else {
      currentAudio.pause();
      isPlaying = false;
    }
    updatePlayButton();
  }
};

window.setVolume = function(val) {
  if (currentAudio) {
    currentAudio.volume = val;
  }
};

function updatePlayButton() {
  const btn = document.getElementById('playPauseBtn');
  const icon = document.getElementById('playPauseIcon');
  if (btn && icon) {
    icon.textContent = isPlaying ? '⏸' : '▶';
    btn.classList.toggle('playing', isPlaying);
  }
}

function setupAudioEvents() {
  if (!currentAudio) return;
  
  // 更新进度条
  currentAudio.addEventListener('timeupdate', () => {
    const progressFill = document.getElementById('progressFill');
    const currentTime = document.getElementById('currentTime');
    const duration = document.getElementById('duration');
    
    if (progressFill && currentAudio.duration) {
      const percent = (currentAudio.currentTime / currentAudio.duration) * 100;
      progressFill.style.width = percent + '%';
    }
    
    if (currentTime) {
      currentTime.textContent = formatTime(currentAudio.currentTime);
    }
    if (duration && currentAudio.duration) {
      duration.textContent = formatTime(currentAudio.duration);
    }
  });
  
  // 点击进度条跳转
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      if (currentAudio && currentAudio.duration) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        currentAudio.currentTime = percent * currentAudio.duration;
      }
    });
  }
}

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 更新导航
function updateNav() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const navCurrent = document.getElementById('navCurrent');
  
  if (prevBtn) prevBtn.disabled = currentDay <= 1;
  if (nextBtn) nextBtn.disabled = currentDay >= maxDay;
  if (navCurrent) navCurrent.textContent = `Day ${currentDay}`;
}

// 绑定导航事件
document.addEventListener('DOMContentLoaded', () => {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentDay > 1) {
        // 停止当前音乐
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
          isPlaying = false;
        }
        renderWelcome(currentDay - 1);
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentDay < maxDay) {
        // 停止当前音乐
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
          isPlaying = false;
        }
        renderWelcome(currentDay + 1);
      }
    });
  }
  
  init();
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
