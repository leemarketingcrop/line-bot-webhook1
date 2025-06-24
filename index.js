const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);
const app = express();

// webhook endpoint
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('❌ Error handling event:', err);
      res.status(500).end(); // 告知 LINE 發生錯誤
    });
});

// event handler function
function handleEvent(event) {
  // 忽略群組訊息
  if (event.source.type === 'group') {
    console.log('📢 Ignored group message');
    return Promise.resolve(null);
  }

  // 回覆文字訊息
  if (event.type === 'message' && event.message.type === 'text') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `你說的是：${event.message.text}`
    });
  }

  // 其他類型不處理
  return Promise.resolve(null);
}

// 測試首頁
app.get('/', (req, res) => res.send('✅ LINE Bot is running'));

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ LINE Bot is running on port ${port}`);
});
