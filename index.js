const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);
const app = express();

// webhook 接收路由
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('Webhook 處理錯誤：', err);
      res.status(500).end();
    });
});

// 首頁測試
app.get('/', (req, res) => res.send('LINE Bot is running'));

// 處理訊息邏輯
function handleEvent(event) {
  if (event.source.type === 'group') {
    return Promise.resolve(null); // 群組不回應
  }

  if (event.type === 'message' && event.message.type === 'text') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `你說的是：${event.message.text}`
    });
  }

  return Promise.resolve(null);
}

// 伺服器監聽
app.listen(process.env.PORT || 3000, () => {
  console.log('✅ LINE Bot is running on port', process.env.PORT || 3000);
});
