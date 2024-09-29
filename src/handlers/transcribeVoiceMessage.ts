import ffmpeg from "fluent-ffmpeg";
import * as fs from "fs";
import fetch from "node-fetch";
import { Message } from "node-telegram-bot-api";
import { openai } from "../lib/openai";
import { bot, botToken } from "../lib/telegram";

export async function transcribeVoiceMessage(msg: Message): Promise<string> {
  try {
    if (!msg.voice) {
      return "error";
    }

    const fileDetails = await bot.getFile(msg.voice.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileDetails.file_path}`;
    const voiceMessageBuffer = await fetch(fileUrl).then((res) => res.buffer());
    const oggFileName = `./temp/${msg.voice.file_id}.ogg`;
    const wavFileName = `./temp/${msg.voice.file_id}.wav`;

    fs.writeFileSync(oggFileName, voiceMessageBuffer);
    await convertOggToWav(oggFileName, wavFileName);

    const transcribedText = await sendToWhisperApi(wavFileName);

    fs.unlinkSync(oggFileName);
    fs.unlinkSync(wavFileName);

    return transcribedText;
  } catch (error) {
    console.error("Error in transcribeVoiceMessage:", error);
    return "Error transcribing message";
  }
}

function convertOggToWav(inputPath: string, outputPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("wav")
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
}

async function sendToWhisperApi(audioFilePath: string): Promise<string> {
  if (!fs.existsSync(audioFilePath)) {
    throw new Error(`File not found: ${audioFilePath}`);
  }

  const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: fs.createReadStream(audioFilePath),
  });

  return transcription.text;
}
