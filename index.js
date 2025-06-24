const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new line.Client(config);
const app = express();

// 解析 JSON 格式的請求主體
app.use(express.json());

// Webhook 路由處理
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

// 處理每個事件
async function handleEvent(event) {
  try {
    // 忽略群組訊息
    if (event.source.type === 'group') {
      console.log('⛔ 忽略群組訊息');
      return null;
    }

    // 回應文字訊息
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

// Render 健康檢查頁面
app.get('/', (req, res) => {
  res.send('✅ LINE Bot is live and healthy');
});

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 LINE Bot 已啟動於埠號 ${port}`);
});
