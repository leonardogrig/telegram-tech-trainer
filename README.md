
## Disclaimer

**Note:** This project is currently in its early stages and represents a quick prototype solution. It was developed as a proof of concept and may contain bugs or lack sophisticated error handling. If this project generates significant interest from the community, I am open to expanding it into a more comprehensive and robust application. Your feedback and contributions are welcome!

For now, please use this code as a starting point or for educational purposes, and feel free to reach out if you have ideas for improvement or would like to see this developed into a full-fledged application.

---

# Telegram Bot Quiz Project

This project implements a Telegram bot that conducts a quiz by asking questions at regular intervals. Users can interact with the bot using text commands and voice messages.

## Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime and package manager)
- OpenAI API key
- Telegram Bot Token

## Installation

1. Install Bun:

   - On Windows, you can use Chocolatey:
     ```
     choco install bun
     ```
   - For other operating systems, refer to the [official Bun installation guide](https://bun.sh/docs/installation).

2. Clone the repository and navigate to the project directory.

3. Install dependencies:
   ```
   bun install
   ```

## Configuration

1. Create a `.env` file in the root directory of the project.

2. Add the following environment variables to the `.env` file:

   ```
   OPENAI_API_KEY=your_openai_api_key
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```

   - To get an OpenAI API key:

     1. Go to [OpenAI's website](https://openai.com/)
     2. Sign up or log in to your account
     3. Navigate to the API section
     4. Generate a new API key

   - To get a Telegram Bot Token:
     1. Open Telegram and search for the BotFather
     2. Start a chat and send `/newbot`
     3. Follow the prompts to create a new bot
     4. BotFather will provide you with a token for your new bot

## Running the Project

To start the bot, run the following command in the project root directory:

```
bun run src/index.ts
```

## Bot Behavior and Commands

- `/start`: Begins the quiz session. The bot will start sending questions at regular intervals.
- `/stop`: Ends the current quiz session.
- `/time`: Shows how much time is left until the next question.
- `/change_time: [minutes]`: Changes the interval between questions (minimum 5 minutes).
- `answer: [your answer]`: Submit an answer to the current question.
- Voice message: Send a voice message to answer the current question (will be transcribed).

The bot will ask a new question every 5 minutes by default. Users have 3 minutes to answer each question before it times out.

## Notes

- Ensure that your `questions.json` file is properly formatted and located in the project root directory.
- The bot uses OpenAI's API for voice transcription and answer evaluation, so make sure your API key is valid and has sufficient credits.

## Troubleshooting

If you encounter any issues:

- Verify that your `.env` file is correctly set up with valid API keys.
- Ensure that Bun is properly installed and updated to the latest version.
- Check your internet connection, as the bot requires internet access to communicate with Telegram and OpenAI APIs.

For any other problems, please open an issue in the project repository.
