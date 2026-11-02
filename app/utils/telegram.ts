import { formatDate } from "./formatDate";

export async function sendTelegramMessage(text: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_USER;

  if (!botToken || !chatId) {
    return;
  }

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `${text}\n🕒 Fecha: ${formatDate()}`,
      parse_mode: "HTML",
    }),
  });
}
