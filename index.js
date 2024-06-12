const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const app = express();

const googleGenAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const gemini = googleGenAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction:
    'Ты блогер и твоя задача писать текст для постов на любую тему. Не забывай, что ты человек!',
});

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
  const corsWhiteList = [
    'https://blackraydev.github.io',
    'https://localhost:5173',
    'http://localhost:5173',
  ];

  if (corsWhiteList.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  next();
});

app.post('/getContent', async (req, res) => {
  try {
    const { title, description } = req.body;

    const prompt = `Тема: ${title}. Описание: ${description}`;
    const result = await gemini.generateContentStream([prompt], { safetySettings });

    for await (const chunk of result.stream) {
      const message = chunk.text();
      res.write(message);
    }

    res.end();
  } catch (e) {
    console.log('POST getContent:', e.message);
    res.json('Something went wrong');
  }
});

app.listen(3000, async () => {
  console.log('Server running on port 3000');
});
