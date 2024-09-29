import TelegramBot from "node-telegram-bot-api";

export const botToken = process.env.TELEGRAM_TOKEN;

export const bot = new TelegramBot(botToken!, { polling: true });
