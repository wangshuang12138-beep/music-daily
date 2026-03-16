// 音乐日报应用
let musicData = {};
let currentDate = '';
let allTags = new Set();
let isPlaying = false;

// 初始化
async function init() {
  await loadData();
  setupDateNavigation();
  setupFilter();
  setupDatePicker();
  
  // 默认显示今天，如果没有则显示最新
  const today = formatDate(new Date());
  if (musicData[today]) {
    loadDay(today);
  } else {
    // 找到最新的日期
    const dates = Object.keys(musicData).sort().reverse();
    if (dates.length > 0) {
      loadDay(dates[0]);
    }
  }
  
  // 隐藏加载动画
  document.getElementById('loading').classList.add('hidden');
}

// 加载数据
async function loadData() {
  try {
    const response = await fetch('data.json');
    musicData = await response.json();
    
    // 收集所有标签
    Object.values(musicData).forEach(song => {
      song.tags?.forEach(tag => allTags.add(tag));
    });
  } catch (error) {
    console.error('加载数据失败:', error);
    musicData = {};
  }
}

// 加载某一天的歌曲
function loadDay(date) {
  currentDate = date;
  const song = musicData[date];
  
  if (!song) {
    showEmptyState();
    return;
  }
  
  // 更新背景
  document.getElementById('bgImage').src = song.cover;
  
  // 更新专辑封面
  document.getElementById('albumCover').src = song.cover;
  
  // 更新歌曲信息
  document.getElementById('songTitle').textContent = song.title;
  document.getElementById('songArtist').textContent = `${song.artist} · ${song.album}`;
  document.getElementById('quote').textContent = song.quote || '';
  document.getElementById('description').textContent = song.description || '';
  
  // 更新标签
  const tagsContainer = document.getElementById('tags');
  tagsContainer.innerHTML = '';
  song.tags?.forEach(tag => {
    const tagEl = document.createElement('span');
    tagEl.className = 'tag';
    tagEl.textContent = tag;
    tagEl.addEventListener('click', () => openFilterWithTag(tag));
    tagsContainer.appendChild(tagEl);
  });
  
  // 更新播放器
  const playerFrame = document.getElementById('playerFrame');
  playerFrame.src = `https://music.163.com/outchain/player?type=2&id=${song.neteaseId}&auto=0&height=66`;
  
  // 更新外部链接
  document.getElementById('externalLink').href = `https://music.163.com/#/song?id=${song.neteaseId}`;
  
  // 更新日期显示
  updateDateDisplay();
  
  // 重置播放状态
  isPlaying = false;
  document.getElementById('albumContainer').classList.remove('playing');
}

// 显示空状态
function showEmptyState() {
  document.getElementById('songTitle').textContent = '暂无推荐';
  document.getElementById('songArtist').textContent = '这一天没有音乐推荐';
  document.getElementById('quote').textContent = '';
  document.getElementById('description').textContent = '请选择其他日期查看';
  document.getElementById('tags').innerHTML = '';
  document.getElementById('albumCover').src = '';
  document.getElementById('bgImage').src = '';
  document.getElementById('playerFrame').src = '';
  updateDateDisplay();
}

// 更新日期显示
function updateDateDisplay() {
  const date = new Date(currentDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDay = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
  
  document.getElementById('currentDate').textContent = `${month}月${day}日 周${weekDay}`;
  
  // 更新按钮状态
  const dates = Object.keys(musicData).sort();
  const currentIndex = dates.indexOf(currentDate);
  document.getElementById('prevBtn').disabled = currentIndex <= 0;
  document.getElementById('nextBtn').disabled = currentIndex >= dates.length - 1;
}

// 设置日期导航
function setupDateNavigation() {
  document.getElementById('prevBtn').addEventListener('click', () => {
    const dates = Object.keys(musicData).sort();
    const currentIndex = dates.indexOf(currentDate);
    if (currentIndex > 0) {
      loadDay(dates[currentIndex - 1]);
    }
  });
  
  document.getElementById('nextBtn').addEventListener('click', () => {
    const dates = Object.keys(musicData).sort();
    const currentIndex = dates.indexOf(currentDate);
    if (currentIndex < dates.length - 1) {
      loadDay(dates[currentIndex + 1]);
    }
  });
  
  // 点击日期显示日期选择器
  document.getElementById('currentDate').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('datePicker').classList.toggle('active');
  });
  
  // 点击其他地方关闭日期选择器
  document.addEventListener('click', () => {
    document.getElementById('datePicker').classList.remove('active');
  });
  
  document.getElementById('datePicker').addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

// 日期选择器
let pickerCurrentDate = new Date();

function setupDatePicker() {
  renderDatePicker();
  
  document.getElementById('pickerPrev').addEventListener('click', () => {
    pickerCurrentDate.setMonth(pickerCurrentDate.getMonth() - 1);
    renderDatePicker();
  });
  
  document.getElementById('pickerNext').addEventListener('click', () => {
    pickerCurrentDate.setMonth(pickerCurrentDate.getMonth() + 1);
    renderDatePicker();
  });
}

function renderDatePicker() {
  const year = pickerCurrentDate.getFullYear();
  const month = pickerCurrentDate.getMonth();
  
  document.getElementById('pickerMonth').textContent = `${year}年${month + 1}月`;
  
  const grid = document.getElementById('pickerGrid');
  grid.innerHTML = '';
  
  // 星期标题
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  weekDays.forEach(day => {
    const label = document.createElement('div');
    label.className = 'day-label';
    label.textContent = day;
    grid.appendChild(label);
  });
  
  // 计算日期
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // 空白天数
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'day empty';
    grid.appendChild(empty);
  }
  
  // 日期
  const today = formatDate(new Date());
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = formatDate(new Date(year, month, i));
    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    dayEl.textContent = i;
    
    if (dateStr === today) {
      dayEl.classList.add('today');
    }
    
    if (musicData[dateStr]) {
      dayEl.classList.add('has-music');
    }
    
    if (dateStr === currentDate) {
      dayEl.style.background = 'rgba(255,255,255,0.3)';
    }
    
    dayEl.addEventListener('click', () => {
      if (musicData[dateStr]) {
        loadDay(dateStr);
        document.getElementById('datePicker').classList.remove('active');
      }
    });
    
    grid.appendChild(dayEl);
  }
}

// 设置筛选
function setupFilter() {
  document.getElementById('filterBtn').addEventListener('click', () => {
    document.getElementById('filterPanel').classList.add('active');
    renderFilterTags();
    renderFilterResults();
  });
  
  document.getElementById('closeFilter').addEventListener('click', () => {
    document.getElementById('filterPanel').classList.remove('active');
  });
}

function openFilterWithTag(tag) {
  document.getElementById('filterPanel').classList.add('active');
  renderFilterTags(tag);
  renderFilterResults(tag);
}

function renderFilterTags(activeTag = null) {
  const container = document.getElementById('filterTags');
  container.innerHTML = '';
  
  // 添加"全部"
  const allTag = document.createElement('span');
  allTag.className = 'filter-tag' + (activeTag === null ? ' active' : '');
  allTag.textContent = '全部';
  allTag.addEventListener('click', () => {
    renderFilterTags();
    renderFilterResults();
  });
  container.appendChild(allTag);
  
  // 添加所有标签
  Array.from(allTags).sort().forEach(tag => {
    const tagEl = document.createElement('span');
    tagEl.className = 'filter-tag' + (tag === activeTag ? ' active' : '');
    tagEl.textContent = tag;
    tagEl.addEventListener('click', () => {
      renderFilterTags(tag);
      renderFilterResults(tag);
    });
    container.appendChild(tagEl);
  });
}

function renderFilterResults(tag = null) {
  const container = document.getElementById('filterResults');
  container.innerHTML = '';
  
  const filtered = Object.entries(musicData)
    .filter(([date, song]) => !tag || song.tags?.includes(tag))
    .sort((a, b) => b[0].localeCompare(a[0]));
  
  filtered.forEach(([date, song]) => {
    const item = document.createElement('div');
    item.className = 'result-item';
    
    const dateObj = new Date(date);
    const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
    
    item.innerHTML = `
      <img class="result-cover" src="${song.cover}" alt="">
      <div class="result-info">
        <div class="result-title">${song.title}</div>
        <div class="result-artist">${song.artist}</div>
      </div>
      <div class="result-date">${dateStr}</div>
    `;
    
    item.addEventListener('click', () => {
      loadDay(date);
      document.getElementById('filterPanel').classList.remove('active');
    });
    
    container.appendChild(item);
  });
}

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 播放按钮（由于 iframe 限制，主要作为视觉反馈）
document.getElementById('playOverlay').addEventListener('click', () => {
  isPlaying = !isPlaying;
  document.getElementById('albumContainer').classList.toggle('playing', isPlaying);
});

// 启动
init();
