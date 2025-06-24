const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);
const app = express();

// Webhook 路由
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error('Webhook 處理錯誤：', err);
      res.status(500).end();
    });
});

// 首頁測試用路由
app.get('/', (req, res) => res.send('LINE Bot is running'));

// 處理訊息事件
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

// 啟動伺服器（Render 用）
app.listen(process.env.PORT || 3000, () => {
  console.log('✅ LINE Bot is running on port', process.env.PORT || 3000);
});
