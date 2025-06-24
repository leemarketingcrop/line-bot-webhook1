const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);
const app = express();

// 使用 JSON 中介軟體解析請求主體
app.use(express.json());

// webhook 接收訊息事件
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events;
    const results = await Promise.all(events.map(handleEvent));
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Webhook 處理錯誤:', err);
    res.status(500).end();
  }
});

// 處理每一筆事件
async function handleEvent(event) {
  // 忽略群組訊息
  if (event.source.type === 'group') {
    console.log('⛔ 忽略群組訊息');
    return null;
  }

  // 回覆文字訊息
  if (event.type === 'message' && event.message.type === 'text') {
    const replyText = `你說的是：${event.message.text}`;
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: replyText
    });
    return { status: 'ok' };
  }

  return null;
}

// Render 健康檢查首頁
app.get('/', (req, res) => {
  res.send('✅ LINE Bot is live and healthy');
});

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 LINE Bot 已啟動於埠號 ${port}`);
});
