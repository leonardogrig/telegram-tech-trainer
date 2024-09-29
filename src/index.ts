import * as fs from "fs";
import { Message } from "node-telegram-bot-api";
import { evaluateAnswer } from "./handlers/evaluateAnswer";
import { transcribeVoiceMessage } from "./handlers/transcribeVoiceMessage";
import {
  getNextQuestion,
  getTimeInfo,
  shuffleQuestions,
} from "./lib/functions";
import { bot } from "./lib/telegram";

let questions = shuffleQuestions(
  JSON.parse(fs.readFileSync("./questions.json", "utf-8")).questions
);
let currentIndex = 0;
let studyTimer: string | number | NodeJS.Timeout | null | undefined;
let lastQuestionTime: Date | null = null;
const questionTimeout = 180000; // 3m
export let quizInterval = 300000; // 5m
let executing = false;
export let currentQuestion: string | null = "";
let currentTopic: string | null = "";
let completeQuestion: string | null = "";
let currentObject: Question = { topic: "", question: "" };
export let lastQuestionTimeForQuestion = 0;

bot.onText(/start/, (msg) => onStart(msg));
bot.onText(/stop/, (msg) => onStop(msg));
bot.onText(/answer: (.+)/, (msg, match) => onAnswer(msg, match));
bot.on("voice", (msg) => onVoiceMessage(msg));
bot.onText(/time/, (msg) => onTime(msg));
bot.onText(/change_time: (.+)/, (msg, match) => onChangeTime(msg, match));

function onStart(msg: Message): void {
  executing = true;
  console.log(`Received start command from chat ${msg.chat.id}`);
  bot.sendMessage(msg.chat.id, "Now listening");
  if (!executing || !msg.chat.id) return;
  startQuiz(msg.chat.id);
}

function onStop(msg: Message): void {
  if (studyTimer) {
    clearInterval(studyTimer);
    studyTimer = null;
    lastQuestionTime = null;
    console.log(`Received stop command from chat ${msg.chat.id}`);
    bot.sendMessage(msg.chat.id, "Stopping study");
  }
}

function onAnswer(msg: Message, match: RegExpExecArray | null): void {
  if (
    match &&
    lastQuestionTime &&
    new Date().getTime() - lastQuestionTime.getTime() < questionTimeout
  ) {
    const response = match[1];
    console.log(`Received answer from chat ${msg.chat.id}: ${response}`);
    evaluateAnswer(msg.chat.id, response);
  }
}

async function onVoiceMessage(msg: Message): Promise<void> {
  if (
    msg.voice &&
    lastQuestionTime &&
    new Date().getTime() - lastQuestionTime.getTime() < questionTimeout
  ) {
    console.log(`Received voice message from chat ${msg.chat.id}`);
    const transcribedText = await transcribeVoiceMessage(msg);
    evaluateAnswer(msg.chat.id, transcribedText);
  }
}

function onTime(msg: Message): void {
  if (!executing) {
    bot.sendMessage(msg.chat.id, "Nothing is being executed.");
    return;
  }
  const timeInfo = getTimeInfo();
  bot.sendMessage(
    msg.chat.id,
    `The next question will be asked in ${timeInfo.minutesRemaining} minutes and ${timeInfo.secondsRemaining} seconds.`
  );
}

function onChangeTime(msg: Message, match: RegExpExecArray | null): void {
  if (match) {
    const defined = parseInt(match[1]);
    if (defined < 5) {
      bot.sendMessage(msg.chat.id, "The minimum time is 5 minutes");
    } else {
      quizInterval = defined * 60000;
      bot.sendMessage(msg.chat.id, `Time was adjusted to ${defined} minutes`);
    }
  }
}

function startQuiz(chatId: number): void {
  if (!executing) return;

  if (studyTimer) clearInterval(studyTimer);

  console.log(`Starting quiz for chat ${chatId}`);
  sendQuizQuestion(chatId);
  lastQuestionTimeForQuestion = Date.now();

  studyTimer = setInterval(() => {
    sendQuizQuestion(chatId);
    lastQuestionTimeForQuestion = Date.now();
  }, quizInterval);
}

function sendQuizQuestion(chatId: number): void {
  let questionResult = getNextQuestion(questions, currentIndex);
  currentObject = questionResult[0];
  currentIndex = questionResult[1];

  currentQuestion = currentObject.question;
  currentTopic = currentObject.topic;

  completeQuestion = currentTopic + "\n\n" + currentQuestion;

  console.log(`Sending question to chat ${chatId}: ${completeQuestion}`);
  bot.sendMessage(chatId, completeQuestion || "");
  lastQuestionTime = new Date();
}
