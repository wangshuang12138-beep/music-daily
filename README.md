# xca's 音乐故事日记

一个人的日常，一首歌的时间。

## 🌐 在线访问

**https://wangshuang12138-beep.github.io/music-daily/**

## 📁 项目结构

```
music-daily/          ← 每日展示仓库（本仓库）
├── index.html        # 主页面
├── app.js            # 加载逻辑
├── data.json         # 每日歌曲信息
└── README.md         # 本文件

story/                ← 连载故事仓库
├── story.md          # 完整故事（你编辑这个）
├── chapters.json     # 章节索引
└── README.md

assets/               ← 资源仓库
├── music/            # MP3 音频文件
│   ├── 2026-03-16.mp3
│   └── ...
└── logo-xca-square.svg
```

## 📝 每日更新流程

### 第一步：写故事（story 仓库）

1. 编辑 `story/story.md`，添加新的 Day：

```markdown
## Day 2

今天的故事内容...

可以写多段，段落之间空一行。

留下一个悬念：那个蓝色的信封...

---

## Day 3

（待续）
```

2. 更新 `story/chapters.json`：

```json
{
  "chapters": [
    {
      "day": 1,
      "date": "2026-03-16",
      "title": "起点",
      "status": "published"
    },
    {
      "day": 2,
      "date": "2026-03-17",      
      "title": "信封",
      "status": "published"
    }
  ]
}
```

3. 提交到 GitHub：

```bash
git add story.md chapters.json
git commit -m "Add day 2 story"
git push
```

### 第二步：上传音乐（assets 仓库）

1. 将 MP3 文件命名为 `YYYY-MM-DD.mp3` 格式
2. 上传到 `assets/music/` 目录：

```bash
# 本地操作示例
cp ~/Downloads/song.mp3 assets/music/2026-03-17.mp3
git add music/2026-03-17.mp3
git commit -m "Add day 2 music"
git push
```

### 第三步：更新歌曲信息（music-daily 仓库）

编辑 `data.json`，添加新的一天：

```json
{
  "days": [
    {
      "day": 1,
      "date": "2026-03-16",
      "song": {
        "title": "想去海边",
        "artist": "夏日入侵企画",
        "quote": "等一个自然而然的晴天，我想要带你去海边"
      },
      "audioUrl": "https://wangshuang12138-beep.github.io/assets/music/2026-03-16.mp3"
    },
    {
      "day": 2,
      "date": "2026-03-17",
      "song": {
        "title": "歌名",
        "artist": "歌手",
        "quote": "一句金句歌词"
      },
      "audioUrl": "https://wangshuang12138-beep.github.io/assets/music/2026-03-17.mp3"
    }
  ]
}
```

提交到 GitHub：

```bash
git add data.json
git commit -m "Add day 2 music"
git push
```

等待 2-3 分钟后，页面自动更新。

## 🎨 设计说明

- **书信/日记感**：米色背景、衬线字体、手写签名
- **草书签名**：使用 Google Fonts 的 "Ma Shan Zheng" 字体
- **Logo 位置**：日记卡片右下角，像印章一样
- **音频存放**：统一放在 assets 仓库的 music/ 目录

## 🛠 技术栈

- 纯 HTML/CSS/JS，无框架
- GitHub Pages 部署
- 从 story 仓库动态加载 Markdown
- 原生 HTML5 audio 播放器

---

*一个人的日常，一首歌的时间*
