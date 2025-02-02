const contentService = require('../services/content-service');
const tariffService = require('../services/tariff-service');

// TODO: Добавить валидацию на длину текста параметров
class ContentController {
  async generateContent(req, res, next) {
    try {
      const { id: userId } = req.user;
      const contentProps = req.body;

      await tariffService.useTariff(userId, contentProps.mode);

      const contentStream = await contentService.generateContent(contentProps);
      let resultContent = '';

      for await (const chunk of contentStream) {
        if (chunk && chunk.choices && chunk.choices.length > 0) {
          const [choice] = chunk.choices;
          const { content } = choice.delta;

          if (content) {
            resultContent += content;
            res.write(content);
          }
        }
      }

      await contentService.saveContent({
        ...contentProps,
        content: resultContent,
        userId,
      });

      return res.end();
    } catch (e) {
      next(e);
    }
  }

  async deleteContent(req, res, next) {
    try {
      const { id: contentId } = req.body;
      await contentService.deleteContent(contentId);

      return res.status(204).end();
    } catch (e) {
      next(e);
    }
  }

  async getContents(req, res, next) {
    try {
      const { id: userId } = req.user;
      const contents = await contentService.getContents(userId);

      return res.json(contents);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new ContentController();
