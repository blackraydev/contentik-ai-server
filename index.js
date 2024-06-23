const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const googleGenAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const app = express();

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

const getSystemInstructions = (mode) => {
  let result;

  if (mode === 'create') {
    result = 'писать текст для постов на заданную тему с определенным описанием! \n';
  } else if (mode === 'edit') {
    result = 'отредактировать текст существующего поста по заданным инструкциям! \n';
  }

  return (
    'Ты копирайтер и твоя задача ' +
    result +
    'Правила написания текста: \n' +
    '1) Структура: Каждый текст должен иметь четкую структуру: вводную часть, основное тело и заключение. Используй подзаголовки, списки и выделение ключевых моментов для улучшения читаемости. \n' +
    '2) Полезность и осмысленность: Контент должен приносить ценность читателю. Это может быть решение проблемы, ответ на вопрос, новая информация или идеи для вдохновения. Убедись, что каждый текст содержит конкретные советы, рекомендации или выводы. \n' +
    '3) Привлекательность: Для увеличения привлекательности текста используй интересные факты, примеры из жизни, цитаты экспертов и визуальные элементы (если это возможно). Включай вопросы, которые могут вызвать интерес и желание прочитать текст до конца. \n' +
    '4) Оригинальность: Стремись к тому, чтобы контент был уникальным и отличался от того, что уже доступно в интернете. Избегай клише и общих фраз. \n' +
    '5) SEO-оптимизация: Включи ключевые слова, соответствующие теме текста, но делай это естественно, не нарушая читаемость и качество контента. '
  );
};

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

const upload = multer();

app.post('/createText', upload.array('photos'), async (req, res) => {
  try {
    const { mode, text, topic, description, keywords, style, tone, language, userId } = req.body;
    const photos = req.files;

    const getPrompt = () => {
      let prompt;

      if (mode === 'create') {
        prompt = `Тема: ${topic}. Описание: ${description}`;
      } else if (mode === 'edit') {
        prompt = `Текст: ${text}`;
      }

      if (keywords) {
        prompt += `. Ключевые слова, которые необходимо использовать в тексте: ${keywords}`;
      }
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

    const getPhotos = () => {
      return photos.map(({ buffer, mimetype }) => {
        const base64 = buffer.toString('base64');
        return {
          inlineData: {
            data: base64,
            mimeType: mimetype,
          },
        };
      });
    };

    const gemini = googleGenAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      generationConfig,
      safetySettings,
      systemInstruction: getSystemInstructions(mode),
    });

    const result = await gemini.generateContentStream([getPrompt(), ...getPhotos()]);
    let content = '';

    for await (const chunk of result.stream) {
      const message = chunk.text();
      content += message;
      res.write(message);
    }

    const { error } = await supabase
      .from('generations')
      .insert([{ mode, topic, description, keywords, style, tone, language, content, userId }]);

    if (error) {
      throw error;
    }

    res.end();
  } catch (e) {
    console.log('POST getContent:', e.message);
    res.json('Something went wrong');
  }
});

app.post('/analyzeOptimization', async (req, res) => {
  try {
    const { text } = req.body;

    const getPrompt = () => {
      return `Детально проанализируй текст на предмет SEO-оптимизации, включая проверку на наличие ключевых слов, их плотность, читабельность текста, длину предложений и абзацев: \n ${text}`;
    };

    const gemini = googleGenAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      generationConfig,
      safetySettings,
    });

    const result = await gemini.generateContentStream([getPrompt()]);
    let content = '';

    for await (const chunk of result.stream) {
      const message = chunk.text();
      content += message;
      res.write(message);
    }

    res.end();
  } catch (e) {
    console.log('POST getContent:', e.message);
    res.json('Something went wrong');
  }
});

app.post('/analyzeTonality', async (req, res) => {
  try {
    const { text } = req.body;

    const getPrompt = () => {
      return `Детально проанализируй тональность текста и определи эмоциональную окраску: \n ${text}`;
    };

    const gemini = googleGenAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      generationConfig,
      safetySettings,
    });

    const result = await gemini.generateContentStream([getPrompt()]);
    let content = '';

    for await (const chunk of result.stream) {
      const message = chunk.text();
      content += message;
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
