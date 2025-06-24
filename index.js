const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);
const app = express();

// 👉 Webhook 路由：收到事件時處理
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error('❌ Webhook 處理錯誤：', err);
      res.status(500).end();
    });
});

// 處理事件邏輯：群組略過、人對話回應
function handleEvent(event) {
  if (event.source.type === 'group') {
    console.log('⛔ 忽略群組訊息');
    return Promise.resolve(null);
  }

  if (event.type === 'message' && event.message.type === 'text') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `你說的是：${event.message.text}`
    });
  }

  return Promise.resolve(null);
}

// ✅ 健康檢查首頁，Render 啟動後確認服務在線
app.get('/', (req, res) => {
  res.send('✅ LINE Bot is live and healthy');
});

// 🚀 啟動 Express 伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 LINE Bot 已啟動於埠號 ${port}`);
});
