# Recap 2026-04-13 — Line2Discord 完整建置

## Discord 伺服器設定

- 建立 Discord 伺服器「經理人AIPM班（第一期）」（Study Group 模板）
- 重新命名頻道：
  - `#公告`、`#資源分享`（Information 分類）
  - `#一般討論`、`#問題與回答`（Text Channels 分類）
- 刪除多餘模板頻道：session-planning、off-topic、Lounge、Study Room 1、Study Room 2
- 新增頻道：
  - `#line-群組紀錄` — LINE 群組對話與圖片備份
  - `#龍蝦交流專區` — 只限龍蝦玩耍（bot playground）
  - `#第二組專區` — 第二組成員專屬空間
- 建立「成員」角色
- 產生永不過期邀請連結：`https://discord.gg/vuQkpqUtwH`
- 建立 `#line-群組紀錄` 頻道的 Discord Webhook（用於 LINE 訊息轉發）

## LINE Bot 設定

- 在 LINE Official Account Manager 建立官方帳號「經理人AIPM班Bot」（@557dryeb）
- Provider：馬克路思科技
- 啟用 Messaging API
- 取得 Channel Secret 及 Channel Access Token
- 設定：
  - 允許加入群組 ✓
  - 關閉自動回覆 ✓
  - 關閉歡迎訊息 ✓
  - Webhook URL：`https://line2discord-uk6j.onrender.com/webhook` ✓
  - Webhook 驗證成功 ✓

## 程式碼開發

### 核心功能
1. **Discord 邀請回覆** — 在 LINE 群組 @mention Bot 或私訊 Bot，自動回覆 Discord 邀請連結
2. **LINE → Discord 訊息轉發** — 所有 LINE 群組訊息自動轉發至 Discord `#line-群組紀錄` 頻道
   - 支援：文字、圖片（檔案上傳）、貼圖、影片、語音、檔案、位置
   - 顯示 LINE 用戶名稱作為 Discord webhook 發送者

### 技術架構
- Node.js + Express + @line/bot-sdk
- Discord Webhook API 轉發訊息
- 部署於 Render（免費方案）

## 部署

- GitHub repo：https://github.com/aipmtw/Line2Discord（aipmtw 帳號）
- Render 部署：https://line2discord-uk6j.onrender.com
- 環境變數：LINE_CHANNEL_SECRET、LINE_CHANNEL_ACCESS_TOKEN、DISCORD_INVITE_URL、DISCORD_WEBHOOK_URL

## 比較頁面

- 建立 `comparison.html` — Claude 公開頁面 vs Discord 頻道比較
- 繁體中文，針對經理人AIPM班（第一期）
- 共同作者：Mark陳炳陵 & Claude Opus 4.6
- 已在 claude.ai 建立 inline artifact 並發布

## 待辦 / 未來功能

- LINE Bot 用戶分析功能：收集群組成員發言，建立個人 profile，評估潛在商業合作夥伴
- Bot 已成功加入 LINE 群組並測試通過（手機端）
- PC LINE @mention 功能有已知相容性問題（不影響手機使用）

---

## 傳統工單拆解估算

若以傳統方式指派給工程師/團隊執行，本次工作可拆為以下工單：

| # | 工單名稱 | 說明 | 預估工時 |
|---|---------|------|---------|
| 1 | Discord 伺服器建立與頻道設定 | 建立伺服器、命名頻道、刪除多餘頻道、建立角色、產生邀請連結 | 1 hr |
| 2 | LINE Official Account 建立 | 註冊官方帳號、啟用 Messaging API、取得憑證、關閉自動回覆/歡迎訊息 | 1.5 hr |
| 3 | LINE Bot 核心開發 — Discord 邀請回覆 | Express server + LINE webhook + @mention 偵測 + 回覆邀請訊息 | 3 hr |
| 4 | LINE → Discord 訊息轉發功能 | Discord Webhook 整合、文字/圖片/貼圖/多媒體轉發、用戶名稱顯示 | 4 hr |
| 5 | 部署設定（Render） | GitHub repo 建立、Render 服務設定、環境變數、部署驗證 | 1.5 hr |
| 6 | LINE Webhook 設定與端對端測試 | 設定 Webhook URL、驗證連線、群組內 @mention 測試、訊息轉發測試 | 1.5 hr |
| 7 | 比較頁面製作 | Claude 公開頁面 vs Discord 頻道比較 HTML 頁面、Claude artifact 發布 | 2 hr |
| 8 | 文件撰寫 | README、plan.md、.env.example、recap 文件 | 1 hr |

### 總計

| 項目 | 數值 |
|------|------|
| **工單數** | 8 張 |
| **預估總工時** | 15.5 小時 |
| **實際完成時間（AI 協作）** | ~3 小時 |
| **效率提升** | ~5x |

### 備註
- 傳統估算假設為有經驗的全端工程師（熟悉 LINE SDK、Discord API、Node.js、雲端部署）
- 若工程師不熟悉 LINE Messaging API 或 Discord Webhook，需額外加 2-4 小時學習時間
- 不含需求討論、code review、QA 測試等流程時間
- AI 協作模式下，需求討論與實作同步進行，大幅減少來回溝通成本
