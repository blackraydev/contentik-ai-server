const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const app = express();

const googleGenAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const gemini = googleGenAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
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

const generationConfig = {
  topP: 0.9,
  topK: 50,
  temperature: 1,
};

const systemInstruction =
  'Ты копирайтер и твоя задача писать текст для постов на заданную тему с определенным описанием!\n' +
  'Правила написания текста: \n' +
  '1) Структура: Каждый текст должен иметь четкую структуру: вводную часть, основное тело и заключение. Используй подзаголовки, списки и выделение ключевых моментов для улучшения читаемости. \n' +
  '2) Полезность и осмысленность: Контент должен приносить ценность читателю. Это может быть решение проблемы, ответ на вопрос, новая информация или идеи для вдохновения. Убедись, что каждый текст содержит конкретные советы, рекомендации или выводы. \n' +
  '3) Привлекательность: Для увеличения привлекательности текста используй интересные факты, примеры из жизни, цитаты экспертов и визуальные элементы (если это возможно). Включай вопросы, которые могут вызвать интерес и желание прочитать текст до конца. \n' +
  '4) Оригинальность: Стремись к тому, чтобы контент был уникальным и отличался от того, что уже доступно в интернете. Избегай клише и общих фраз. \n' +
  '5) SEO-оптимизация: Включи ключевые слова, соответствующие теме текста, но делай это естественно, не нарушая читаемость и качество контента. ';

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
    const { topic, description, style, tone, language } = req.body;

    const getPrompt = () => {
      let prompt = `Тема: ${topic}. Описание: ${description}`;

      if (style) {
        prompt += `. Стиль написания: ${style}`;
      }
      if (tone) {
        prompt += `. Тон: ${tone}`;
      }
      if (language) {
        prompt += `. Язык: ${language}`;
      }

      return prompt;
    };

    const result = await gemini.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: getPrompt() }] }],
      generationConfig,
      safetySettings,
      systemInstruction,
    });

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
