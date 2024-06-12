const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const app = express();

const googleGenAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const geminiPro = googleGenAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  const corsWhiteList = ['https://blackraydev.github.io', 'https://localhost:5173'];

  if (corsWhiteList.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  next();
});

app.post('/askChatik', async (req, res) => {
  try {
    const { conversationId, userMessage } = req.body;

    const messages = await Messages.findAll({ where: { conversationId } });
    const history = messages.map((message) => ({
      role: message.role,
      parts: [{ text: message.text }],
    }));

    const chat = geminiPro.startChat({ history, safetySettings });
    const geminiResponse = await chat.sendMessageStream(userMessage.toString());

    let botMessage = '';

    for await (const chunk of geminiResponse.stream) {
      const message = chunk.text();

      botMessage += message;
      res.write(message);
    }

    res.end();
  } catch (e) {
    console.log('POST AskChatik:', e.message);
    res.json('Something went wrong');
  }
});

app.listen(3000, async () => {
  console.log('Server running on port 3000');
});
