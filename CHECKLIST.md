# music-daily 每日更新检查清单

**最后更新**: 2026-03-21
**适用范围**: Day 4 及以后的每日更新

---

## 问题总结与解决方案

### ❌ 已出现的问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 1. 故事代码仓不同步 | story.md 更新但 chapters.json 未同步 | 使用检查清单，强制同步更新 |
| 2. 音乐没有推荐出来 | data.json 未更新或格式错误 | Agent 自动选择音乐，无需用户确认 |
| 3. assets仓新增mp3删除原资源 | 使用了强制推送 `-f` | **禁止**使用 `git push -f`，改用正常提交 |
| 4. 只放本地不推送 | 忘记执行 `git push` | 检查清单包含推送验证步骤 |
| 5. 音乐选择阻塞任务 | 等待用户确认导致中断 | **新规则**: Agent 自动选择，直接执行 |

---

## 音乐选择规则 (Agent 自主决策)

**不再等待用户确认，Agent 根据以下原则自动选择:**

1. **情绪匹配**: 歌曲氛围与当天故事情绪一致
2. **风格延续**: 保持华语独立/民谣/流行经典路线
3. **歌词呼应**: 歌词金句能与故事主题产生共鸣
4. **多样性**: 避免连续两天同一艺术家

**选择后直接进入执行流程，不再阻塞。**

---

## 发布 Day N 的完整流程

### Step 1: 获取今日信息
```
今天日期: 2026-03-21 (Day 6)
星期: 星期六
辞职天数: 37 + (6-1) = 42天
音乐: Agent 自动选择，无需用户确认
```

### Step 2: Story 仓库更新 (必须)

**2.1 写故事**
```bash
cd /root/.openclaw/workspace
# 编辑 story.md，添加 Day N 章节
```

**格式检查**:
- [ ] 开头有日期天气: `三月二十一日，星期六，深圳，[天气]，[温度]度`
- [ ] 有辞职天数: `这是裸辞的第四十二天`
- [ ] 情绪渐变，不突变
- [ ] 结尾收束在"听歌"主题

**2.2 更新 chapters.json**
```json
{
  "day": 6,
  "date": "2026-03-21",
  "title": "章节标题",
  "status": "published"
}
```

**2.3 更新 STORY_STATUS.md**
- [ ] 在章节列表中添加 Day N

**2.4 提交并推送 Story 仓库**
```bash
git add story.md chapters.json STORY_STATUS.md
git commit -m "Day N: [章节标题]"
git push origin main
```

### Step 3: music-daily 仓库更新 (必须)

**3.1 更新 data.json**
```bash
cd /root/.openclaw/workspace/music-daily
vim data.json
```

添加:
```json
{
  "day": 6,
  "date": "2026-03-21",
  "song": {
    "title": "歌曲名",
    "artist": "艺术家",
    "quote": "歌词金句"
  },
  "audioUrl": "https://wangshuang12138-beep.github.io/assets/music/2026-03-21.mp3"
}
```

**必填项检查**:
- [ ] day: 数字，与今天匹配
- [ ] date: 格式 "2026-03-21"
- [ ] title: 不为空
- [ ] artist: 不为空
- [ ] quote: 不为空
- [ ] audioUrl: 格式正确

**3.2 提交并推送 music-daily**
```bash
git add data.json
git commit -m "Day N: 添加音乐数据 - [歌曲名]"
git push origin main
```

### Step 4: assets 仓库更新 (必须)

**4.1 上传音乐文件**
```bash
# 使用 gh CLI 上传，禁止强制推送
gh api repos/wangshuang12138-beep/assets/contents/music/2026-03-21.mp3 \
  -X PUT \
  -f message="Add Day N music: [歌曲名]" \
  -f content="$(base64 -w 0 /path/to/music.mp3)" \
  -f branch=main
```

**⚠️ 重要警告**:
- **禁止**使用 `git push -f`
- **禁止**直接覆盖整个 music 目录
- 使用 API 或正常 git 流程追加文件

### Step 5: 验证 (必须)

**5.1 检查远程仓库状态**
```bash
# 检查 story
curl -s https://raw.githubusercontent.com/wangshuang12138-beep/story/main/chapters.json | grep -c "day"

# 检查 music-daily
curl -s https://raw.githubusercontent.com/wangshuang12138-beep/music-daily/main/data.json | grep -c "day"

# 检查 assets
curl -s https://api.github.com/repos/wangshuang12138-beep/assets/contents/music | grep -c "2026-03"
```

**5.2 检查网站显示**
- [ ] 访问 https://wangshuang12138-beep.github.io/music-daily/
- [ ] 确认 Day N 故事显示正常
- [ ] 确认音乐播放正常

---

## 关键禁止事项

### 🔴 绝对禁止
1. **禁止** `git push -f` 到任何仓库
2. **禁止** 跳过音乐推荐
3. **禁止** 日期不连续
4. **禁止** 只更新本地不推送
5. **禁止** 等待用户确认音乐选择 (已取消)

### 🟡 特别注意
1. assets 仓库只能追加文件，不能删除原有文件
2. 推送前必须检查网络连接
3. 推送后必须验证远程状态
4. **音乐选择**: Agent 自主决策，不阻塞流程

---

## 故障排查

| 症状 | 可能原因 | 解决 |
|------|----------|------|
| 网站显示旧内容 | CDN 缓存 | 等待 5-10 分钟或加 `?v=时间戳` |
| 音乐不播放 | assets 文件未上传 | 检查 assets/music 目录 |
| 故事不显示 | chapters.json status 错误 | 确认 status = "published" |
| 日期错乱 | 两个仓库 date 不一致 | 统一检查 date 字段 |

---

## 紧急回滚

如果发布错误需要回滚:

```bash
# 1. 找到上一个正确的 commit
gh api repos/wangshuang12138-beep/story/commits --jq '.[1].sha'

# 2. 回滚 (谨慎使用)
gh api repos/wangshuang12138-beep/story/git/refs/heads/main \
  -X PATCH \
  -f sha=上一次的commit_sha \
  -F force=false  # 禁止强制
```

---

**定时任务**: 每天早上 8:13 执行更新检查
**责任人**: OpenClaw Agent
**检查频率**: 每日一次
**音乐选择**: Agent 自主决策，无需用户确认
