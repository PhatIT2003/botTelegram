const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
// Thay thế giá trị bên dưới bằng token Telegram bạn nhận được từ @BotFather
const token = [process.env.PRIVATE_KEY];

// Tạo bot sử dụng 'polling' để lấy các cập nhật mới
const bot = new TelegramBot(token, {
  polling: true
});
bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;
});
// Xử lý tin nhắn thông thường
bot.on('message', msg => {
  const chatId = msg.chat.id;
  // const userId = msg.from.id; // Lấy userId từ tin nhắn
  // const firstName = msg.from.first_name; // Lấy firstName từ tin nhắn   

  // Tạo URL với dữ liệu khởi động
  const gameUrl = `https://frontend-omega-ashen-76.vercel.app`;
  console.log('Game URL:', gameUrl);
  // Tạo bàn phím inline với nút để mở game
  const mainKeyboard = {
    inline_keyboard: [[{
      text: '🎮 Chơi Game',
      web_app: {
        url: gameUrl
      }
    }], [{
      text: '📚 Hướng dẫn',
      callback_data: 'guide'
    }, {
      text: '🏆 Bảng xếp hạng',
      callback_data: 'leaderboard'
    }], [{
      text: '⚙️ Cài đặt',
      callback_data: 'settings'
    }, {
      text: '📞 Yêu cầu hỗ trợ',
      callback_data: 'support'
    }], [{
      text: '💡 Gợi ý',
      callback_data: 'tips'
    }]]
  };
  bot.sendMessage(chatId, '🔍 Vui lòng sử dụng menu bên dưới để chọn tùy chọn.', {
    reply_markup: mainKeyboard
  });
});

// Xử lý callback query
bot.on('callback_query', callbackQuery => {
  const chatId = callbackQuery.message.chat.id;
  switch (callbackQuery.data) {
    case 'support':
      bot.sendMessage(chatId, '📞 Bạn cần hỗ trợ gì ạ? Hãy cho tôi biết yêu cầu của bạn.');
      break;
    case 'guide':
      bot.sendMessage(chatId, '📚 Đây là hướng dẫn cách chơi game...');
      break;
    case 'leaderboard':
      bot.sendMessage(chatId, '🏆 Bảng xếp hạng hiện tại:\n1. Player1\n2. Player2\n3. Player3');
      break;
    case 'settings':
      bot.sendMessage(chatId, '⚙️ Cài đặt của bạn. Bạn có thể thay đổi...');
      break;
    case 'play_game':
      // Thêm trường hợp mới cho nút "Chơi Game"
      bot.sendMessage(chatId, `🔗 Đây là đường link để bắt đầu game: ${gameUrl}`);
      break;
  }
});