const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);
const app = express();

// 使用 JSON 中介軟體來解析請求主體
app.use(express.json());

// Webhook 路由
app.post('/webhook', line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events;
    const results = await Promise.all(events.map(handleEvent));
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ 處理 webhook 發生錯誤:', err);
    res.status(500).end(); // 回傳 500，LINE 就會顯示你現在看到的錯誤訊息
  }
});

// 處理單一事件
async function handleEvent(event) {
  if (event.source.type === 'group') {
    return null; // 不回應群組訊息
  }

  if (event.type === 'message' && event.message.type === 'text') {
    const replyText = `你說的是：${event.message.text}`;
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: replyText
    });
    retur
