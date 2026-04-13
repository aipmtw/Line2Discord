# Line2Discord 實作計畫

## Context

為「經理人AIPM班（第一期）」LINE 群組建立一個 LINE Bot，當成員 @提及 Bot 時，自動回覆 Discord 伺服器邀請連結，將群組成員導引至專屬的 Discord 頻道進行資訊匯集與交流。

---

## Phase 0: 前置作業（手動設定）

### Discord 伺服器建立
1. 建立 Discord 伺服器，命名為「經理人AIPM班（第一期）」
2. 建立頻道：`#公告`、`#一般討論`、`#資源分享`、`#問題與回答`
3. 建立「成員」角色並設定頻道權限
4. 產生限次/限時邀請連結 → 記錄為 `DISCORD_INVITE_URL`

### LINE Developer Console 設定
1. 建立 Messaging API Channel
2. 取得 Channel Secret → `LINE_CHANNEL_SECRET`
3. 取得 Channel Access Token → `LINE_CHANNEL_ACCESS_TOKEN`
4. 關閉自動回覆與問候訊息
5. 將 Bot 加入「經理人AIPM班（第一期）」LINE 群組

---

## Phase 1: 專案結構

```
Line2Discord/
├── src/
│   └── index.js          # 主程式（Express + LINE webhook）
├── .env.example           # 環境變數範本
├── .gitignore
├── package.json
├── render.yaml            # Render 部署設定
└── README.md
```

---

## Phase 2: 實作細節

### package.json
- **Dependencies**: `@line/bot-sdk` ^11.0.0, `express` ^4.21.0, `dotenv` ^16.4.0
- **DevDependencies**: `nodemon` ^3.1.0
- **Scripts**: `start` → `node src/index.js`, `dev` → `npx nodemon src/index.js`

### .env.example
```
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
DISCORD_INVITE_URL=https://discord.gg/your_invite_code
```

### src/index.js — 核心邏輯

1. **啟動**: 載入 dotenv，建立 Express app，初始化 LINE MessagingApiClient
2. **快取 Bot userId**: 啟動時呼叫 `client.getBotInfo()` 取得 Bot 自身的 userId 並快取
3. **健康檢查**: `GET /` 回傳 200 OK
4. **Webhook 路由** (`POST /webhook`):
   - 使用 LINE SDK middleware 驗證簽章
   - 不可使用 `express.json()` 在此路由（會與 SDK middleware 衝突）
   - 遍歷 `req.body.events`，呼叫事件處理函式

5. **事件處理邏輯**:
   - 忽略非 `message` 類型或非 `text` 訊息
   - 檢查 `event.message.mention.mentionees` 是否包含 Bot 的 userId
   - 若為直接訊息（`event.source.type === 'user'`）也回覆（不需檢查 mention）
   - 符合條件時，使用 `client.replyMessage()` 回覆邀請訊息

6. **回覆訊息（繁體中文）**:
```
哈囉！👋

歡迎加入我們的 Discord 伺服器「經理人AIPM班（第一期）」！

🔗 加入連結：{DISCORD_INVITE_URL}

📌 注意事項：
• 此連結僅限本群成員使用，請勿分享給其他人
• 連結有使用次數限制，若已失效請再次 @我 取得新連結
• 加入後請在 #一般討論 頻道打個招呼吧！

期待在 Discord 上見到你！🎉
```

---

## Phase 3: 部署至 Render

### render.yaml
```yaml
services:
  - type: web
    name: line2discord
    runtime: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: LINE_CHANNEL_SECRET
        sync: false
      - key: LINE_CHANNEL_ACCESS_TOKEN
        sync: false
      - key: DISCORD_INVITE_URL
        sync: false
```

### 部署步驟
1. 推送至 GitHub
2. 在 Render 連接 repo，設定環境變數
3. 部署完成後，將 Webhook URL 設定為 `https://<app>.onrender.com/webhook`
4. 在 LINE Console 點擊「驗證」確認連線

> **注意**: Render 免費方案閒置 15 分鐘後會休眠，首次請求需 30-50 秒喚醒，LINE 會自動重試，不影響使用。

---

## Phase 4: 驗證計畫

### 本地測試（ngrok）
1. `npm install` → 複製 `.env.example` 為 `.env` 並填入值
2. `npm run dev` 啟動本地伺服器
3. `ngrok http 3000` 取得 HTTPS URL，設定為 LINE Webhook URL

### 端對端測試

| 步驟 | 操作 | 預期結果 |
|------|------|----------|
| 1 | 在群組發送普通訊息（無 @） | Bot 不回覆 |
| 2 | 在群組 @提及 Bot | Bot 回覆 Discord 邀請訊息 |
| 3 | 私訊 Bot | Bot 回覆邀請訊息 |
| 4 | 點擊邀請連結 | 成功開啟 Discord 伺服器邀請頁 |
| 5 | 接受邀請 | 成功加入 Discord 伺服器 |
| 6 | 發送貼圖/圖片並 @Bot | Bot 不當機，忽略非文字訊息 |

### 驗證清單
- [ ] Bot 已加入 LINE 群組
- [ ] Webhook URL 已設定且驗證通過
- [ ] 自動回覆已關閉
- [ ] @提及 Bot 可觸發回覆
- [ ] Discord 邀請連結有效
- [ ] 非提及訊息被正確忽略
- [ ] Render 部署穩定
- [ ] `.env` 不在版控中

---

## 實作順序
1. 建立 Discord 伺服器與頻道（手動）
2. 設定 LINE Developer Console（手動）
3. 初始化 Node.js 專案，安裝依賴
4. 撰寫 `src/index.js`
5. 建立 `.env.example`、`.gitignore`、`render.yaml`、`README.md`
6. 本地 ngrok 測試
7. 推送 GitHub → 部署 Render
8. 設定 Webhook URL → 最終驗證

## 關鍵檔案
- `src/index.js` — 全部應用邏輯
- `package.json` — 依賴與腳本
- `.env.example` — 環境變數範本
- `render.yaml` — Render 部署藍圖
- `README.md` — 設定與使用說明
