require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const app = express();
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});
const blobClient = new line.messagingApi.MessagingApiBlobClient({
  channelAccessToken: config.channelAccessToken,
});

let botUserId = null;
const userNameCache = {};

async function initBot() {
  try {
    const info = await client.getBotInfo();
    botUserId = info.userId;
    console.log(`Bot userId: ${botUserId}`);
  } catch (err) {
    console.error('Failed to get bot info:', err.message);
  }
}

async function getUserName(event) {
  const userId = event.source.userId;
  if (!userId) return '匿名';
  if (userNameCache[userId]) return userNameCache[userId];
  try {
    let profile;
    if (event.source.type === 'group') {
      profile = await client.getGroupMemberProfile(event.source.groupId, userId);
    } else if (event.source.type === 'room') {
      profile = await client.getRoomMemberProfile(event.source.roomId, userId);
    } else {
      profile = await client.getProfile(userId);
    }
    userNameCache[userId] = profile.displayName;
    return profile.displayName;
  } catch (err) {
    return '未知用戶';
  }
}

async function forwardToDiscord(username, content, imageUrl) {
  if (!DISCORD_WEBHOOK_URL) return;
  const body = {
    username: `LINE｜${username}`,
    content: content || undefined,
  };
  if (imageUrl) {
    body.embeds = [{ image: { url: imageUrl } }];
    if (!content) body.content = undefined;
  }
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('Discord webhook error:', err.message);
  }
}

async function getLineImageBuffer(messageId) {
  try {
    const stream = await blobClient.getMessageContent(messageId);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (err) {
    console.error('Failed to get image:', err.message);
    return null;
  }
}

async function forwardImageToDiscord(username, messageId) {
  if (!DISCORD_WEBHOOK_URL) return;
  const imageBuffer = await getLineImageBuffer(messageId);
  if (!imageBuffer) {
    await forwardToDiscord(username, '[圖片：無法取得]');
    return;
  }
  const boundary = '----FormBoundary' + Date.now();
  const payload = JSON.stringify({ username: `LINE｜${username}` });
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="payload_json"\r\nContent-Type: application/json\r\n\r\n${payload}\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="image.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`;
  const footer = `\r\n--${boundary}--`;
  const body = Buffer.concat([Buffer.from(header), imageBuffer, Buffer.from(footer)]);
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body,
    });
  } catch (err) {
    console.error('Discord image upload error:', err.message);
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
  if (event.type !== 'message') return null;

  const isGroup = event.source.type === 'group' || event.source.type === 'room';
  const username = await getUserName(event);

  // Forward group messages to Discord
  if (isGroup && DISCORD_WEBHOOK_URL) {
    if (event.message.type === 'text') {
      await forwardToDiscord(username, event.message.text);
    } else if (event.message.type === 'image') {
      await forwardImageToDiscord(username, event.message.id);
    } else if (event.message.type === 'sticker') {
      await forwardToDiscord(username, `[貼圖]`);
    } else if (event.message.type === 'video') {
      await forwardToDiscord(username, '[影片]');
    } else if (event.message.type === 'audio') {
      await forwardToDiscord(username, '[語音]');
    } else if (event.message.type === 'file') {
      await forwardToDiscord(username, `[檔案：${event.message.fileName || '未知'}]`);
    } else if (event.message.type === 'location') {
      await forwardToDiscord(username, `[位置：${event.message.title || event.message.address || '未知'}]`);
    }
  }

  // Reply with Discord invite when @mentioned or DM
  if (event.message.type !== 'text') return null;
  const isDM = event.source.type === 'user';
  const isMentioned =
    event.message.mention?.mentionees?.some((m) => m.userId === botUserId);

  if (!isDM && !isMentioned) return null;

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
