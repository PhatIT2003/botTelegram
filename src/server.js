require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

// Cấu hình cơ bản
const TOKEN = process.env.PRIVATE_KEY;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://frontend-omega-ashen-76.vercel.app';
const PORT = process.env.PORT || 3000;

// Khởi tạo Express và Telegram Bot
const app = express();
app.use(bodyParser.json());

const bot = new TelegramBot(TOKEN, { 
  polling: {
    interval: 2000, 
    timeout: 0, 
    autoStart: false 
  }
});

// Hàm tạo bàn phím chính
function createMainKeyboard() {
  return {
    inline_keyboard: [
      [{text: '🎮 Chơi Game', web_app: {url: WEBAPP_URL}}],
      [
        {text: '📚 Hướng dẫn', callback_data: 'guide'}, 
        {text: '🏆 Bảng xếp hạng', callback_data: 'leaderboard'}
      ],
      [
        {text: '⚙️ Cài đặt', callback_data: 'settings'}, 
        {text: '📞 Yêu cầu hỗ trợ', callback_data: 'support'}
      ],
      [{text: '💡 Gợi ý', callback_data: 'tips'}]
    ]
  };
}

// Xử lý lỗi polling
function startPolling() {
  try {
    bot.startPolling({
      restart: true,
      params: {
        timeout: 10
      }
    });
    console.log('Bot polling started successfully');
  } catch (error) {
    console.error('Polling start error:', error);
    setTimeout(startPolling, 5000); // Thử lại sau 5 giây
  }
}

// Xử lý sự kiện polling error
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code);
  if (error.code === 'ETELEGRAM') {
    bot.stopPolling();
    setTimeout(() => startPolling(), 5000);
  }
});


// Xử lý lệnh /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  try {
    bot.sendMessage(chatId, '🤖 Chào mừng bạn đến với game!\n' +
      'Hãy chọn một trong các tùy chọn dưới đây:', {
      reply_markup: createMainKeyboard()
    });
  } catch (error) {
    console.error('Error in /start command:', error);
  }
});

// Xử lý tin nhắn thông thường
// Xử lý tin nhắn thông thường
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // Bỏ qua các lệnh đã được xử lý (như /start)
  if (msg.text && msg.text.startsWith('/')) return;

  try {
    bot.sendMessage(chatId, '🤖 Xin chào! Vui lòng sử dụng menu để tương tác.', {
      reply_markup: createMainKeyboard()
    });
  } catch (error) {
    console.error('Error in message handler:', error);
  }
});


// Xử lý callback query
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  
  // Trả lời callback query để giao diện không bị treo
  bot.answerCallbackQuery(callbackQuery.id);

  try {
    switch(callbackQuery.data) {
      case 'support':
        bot.sendMessage(chatId, '📞 Bạn cần hỗ trợ gì ạ?\n' +
          'Liên hệ: support@game.com\n' +
          'Hotline: 1900-xxxx');
        break;
      case 'guide':
        bot.sendMessage(chatId, '📚 Hướng dẫn chơi game:\n' +
          '• Nhấn nút "Chơi Game" để bắt đầu\n' +
          '• Làm theo hướng dẫn trong game\n' +
          '• Chiến thắng để lên bảng xếp hạng');
        break;
      case 'leaderboard':
        bot.sendMessage(chatId, '🏆 Bảng xếp hạng:\n' +
          '1. Player1 - 1000 điểm\n' +
          '2. Player2 - 950 điểm\n' +
          '3. Player3 - 900 điểm');
        break;
      case 'settings':
        bot.sendMessage(chatId, '⚙️ Cài đặt:\n' +
          '• Âm thanh: Bật\n' +
          '• Thông báo: Bật\n' +
          '• Ngôn ngữ: Tiếng Việt');
        break;
      case 'tips':
        bot.sendMessage(chatId, '💡 Mẹo chơi game:\n' +
          '• Kiên nhẫn và bình tĩnh\n' +
          '• Học hỏi từ những lần chơi trước\n' +
          '• Theo dõi bảng xếp hạng để cải thiện');
        break;
    }
  } catch (error) {
    console.error('Error in callback query:', error);
    bot.sendMessage(chatId, '⚠️ Đã xảy ra lỗi. Vui lòng thử lại.');
  }
});

// Webhook endpoint (tùy chọn)
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
  
  // Bắt đầu polling
  startPolling();
});

// Xử lý các tín hiệu đóng ứng dụng
process.on('SIGINT', () => {
  console.log('Đang đóng bot...');
  bot.stopPolling();
  process.exit(0);
});

module.exports = bot;