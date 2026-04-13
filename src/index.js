require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const app = express();
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

let botUserId = null;

async function initBot() {
  try {
    const info = await client.getBotInfo();
    botUserId = info.userId;
    console.log(`Bot userId: ${botUserId}`);
  } catch (err) {
    console.error('Failed to get bot info:', err.message);
  }
}

const INVITE_MESSAGE = `哈囉！👋

歡迎加入我們的 Discord 伺服器「經理人AIPM班（第一期）」！

🔗 加入連結：${process.env.DISCORD_INVITE_URL}

📌 注意事項：
• 此連結僅限本群成員使用，請勿分享給其他人
• 連結有使用次數限制，若已失效請再次 @我 取得新連結
• 加入後請在 #一般討論 頻道打個招呼吧！

期待在 Discord 上見到你！🎉`;

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const isDM = event.source.type === 'user';
  const isMentioned =
    event.message.mention?.mentionees?.some((m) => m.userId === botUserId);

  if (!isDM && !isMentioned) {
    return null;
  }

  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: 'text', text: INVITE_MESSAGE }],
  });
}

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.json({ success: true }))
    .catch((err) => {
      console.error('Webhook error:', err);
      res.status(500).end();
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initBot();
});
