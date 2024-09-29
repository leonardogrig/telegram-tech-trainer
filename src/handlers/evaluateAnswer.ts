import * as fs from "fs";
import { currentQuestion } from "..";
import { openai } from "../lib/openai";
import { bot } from "../lib/telegram";

export async function evaluateAnswer(
  chatId: number,
  response: string
): Promise<void> {
  const evaluation = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `This question: ${currentQuestion} was answered with: ${response}. \n Please provide a concise feedback for this answer. Be strict and honest. Be tough. Also provide a grade from 0 to 10 in this exact format (with the curly braces): "[10]". After that, give the best concise answer for the question.`,
      },
    ],
    model: "gpt-3.5-turbo",
  });
  bot.sendMessage(
    chatId,
    `Your response: \n${response}\n\n${evaluation.choices[0].message.content}`
  );
  let data;
  try {
    const fileContent = fs.readFileSync("./results.json", "utf8");
    data = fileContent ? JSON.parse(fileContent) : [];
  } catch (error) {
    console.error("Error reading from results.json:", error);
  }
  const savedObject = {
    question: currentQuestion,
    response,
    aiResponse: evaluation.choices[0].message.content,
  };
  data.push(savedObject);
  fs.writeFileSync("./results.json", JSON.stringify(data, null, 2));
  console.log(`Saved evaluation for chat ${chatId}`);
}
