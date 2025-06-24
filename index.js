const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);
const app = express();

// ❶ LINE 的 middleware 要放在最前面處理 raw body，不能在 express.json() 之後
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events;
    if (!events || events.length === 0) {
      return res.status(200).json({ message: 'No events to process' });
    }

    const results = await Promise.all(events.map(handleEvent));
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Webhook 處理錯誤:', err);
    res.status(500).end();
  }
});

// 處理訊息邏輯
async function handleEvent(event) {
  try {
    if (event.source.type === 'group') {
      console.log('⛔ 忽略群組訊息');
      return null;
    }

    if (event.type === 'message' && event.message.type === 'text') {
      const replyText = `你說的是：${event.message.text}`;
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: replyText
      });
      return { status: 'ok' };
    }

    return null;
  } catch (err) {
    console.error('❌ handleEvent 發生錯誤:', err);
    throw err;
  }
}

// 健康檢查用
app.get('/', (req, res) => {
  res.send('✅ LINE Bot is live and healthy');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 LINE Bot 已啟動於埠號 ${port}`);
});
