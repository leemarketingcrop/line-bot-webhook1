const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);
const app = express();

// LINE Webhook 路由
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error('❌ Webhook 處理錯誤:', err);
      res.status(500).end();
    });
});

// 處理收到的事件
function handleEvent(event) {
  // 不回應群組
  if (event.source.type === 'group') {
    console.log('⛔ 忽略群組訊息');
    return Promise.resolve(null);
  }

  // 回應文字訊息
  if (event.type === 'message' && event.message.type === 'text') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `你說的是：${event.message.text}`
    });
  }

  // 其他類型一律不處理
  return Promise.resolve(null);
}

// Render 需要首頁（健康檢查）
app.get('/', (req, res) => {
  res.send('✅ LINE Bot is live and healthy');
});

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 LINE Bot 已啟動於埠號 ${port}`);
});
