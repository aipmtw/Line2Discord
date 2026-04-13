# Line2Discord

LINE Bot，當成員 @提及 Bot 時自動回覆 Discord 伺服器邀請連結。

## 設定

1. 複製 `.env.example` 為 `.env`，填入：
   - `LINE_CHANNEL_SECRET` — LINE Messaging API Channel Secret
   - `LINE_CHANNEL_ACCESS_TOKEN` — LINE Channel Access Token
   - `DISCORD_INVITE_URL` — Discord 邀請連結

2. 安裝依賴：
   ```bash
   npm install
   ```

3. 啟動：
   ```bash
   npm start        # 正式環境
   npm run dev      # 開發環境（自動重啟）
   ```

## 本地測試

使用 ngrok 將本地伺服器暴露至公網：
```bash
ngrok http 3000
```
將 ngrok HTTPS URL + `/webhook` 設定為 LINE Webhook URL。

## 部署至 Render

1. 推送至 GitHub
2. 在 Render 連接 repo，設定環境變數
3. 部署後將 Webhook URL 設為 `https://<app>.onrender.com/webhook`
4. 在 LINE Console 驗證 Webhook 連線

> Render 免費方案閒置 15 分鐘後休眠，首次請求需 30-50 秒喚醒。
