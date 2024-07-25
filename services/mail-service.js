const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Contentik AI | Подтверждение регистрации',
      text: '',
      html: `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="color: #ffffff; font-family: Arial, sans-serif; margin: 0;">
            <div style="background-color: #101012; border-radius: 30px; padding: 25px; text-align: center; max-width: 600px; margin: 0 auto;">
              <div style="display: flex; justify-content: center; margin-bottom: 15px;">
                <img src="https://contentik-ai.ru/img/logo.png" alt="Contentik AI Logo" width="24" height="24" style="display: block; background: #24242A; padding: 8px; border-radius: 10px;">
                <h2 style="margin: 0; color: #ffffff; margin-left: 10px; margin-top: 7px;">Contentik AI</h2>
              </div>
              <p style="font-size: 14px; font-weight: 500; text-align: center; color: #ffffff;">Нажмите на эту кнопку - и ваша почта будет подтверждена</p>
              <a href="${link}" style="display: inline-block; background: #FFFFFF; color: #000000; font-size: 14px; padding: 10px 15px; border-radius: 10px; text-decoration: none; margin-bottom: 20px;">Подтвердить почту</a>
              <p style="color: #9696a5; font-size: 12px; text-align: center;">Если вы не регистрировались в сервисе Contentik AI, просто удалите это письмо</p>
            </div>
          </body>
        </html>
      `,
    });
  }

  async sendResetPasswordMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Contentik AI | Восстановление доступа',
      text: '',
      html: `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body style="color: #ffffff; font-family: Arial, sans-serif; margin: 0;">
            <div style="background-color: #101012; border-radius: 30px; padding: 25px; text-align: center; max-width: 600px; margin: 0 auto;">
              <div style="display: flex; justify-content: center; margin-bottom: 15px;">
                <img src="https://contentik-ai.ru/img/logo.png" alt="Contentik AI Logo" width="24" height="24" style="display: block; background: #24242A; padding: 8px; border-radius: 10px;">
                <h2 style="margin: 0; color: #ffffff; margin-left: 10px; margin-top: 7px;">Contentik AI</h2>
              </div>
              <p style="font-size: 14px; font-weight: 500; text-align: center; color: #ffffff;">Нажмите на эту кнопку, чтобы перейти на страницу восстановления доступа к вашему аккаунту</p>
              <a href="${link}" style="display: inline-block; background: #FFFFFF; color: #000000; font-size: 14px; padding: 10px 15px; border-radius: 10px; text-decoration: none; margin-bottom: 20px;">Восстановить доступ</a>
              <p style="color: #9696a5; font-size: 12px; text-align: center;">Если вы не пытались восстановить доступ в сервисе Contentik, просто
                удалите это письмо</p>
            </div>
          </body>
        </html>
      `,
    });
  }
}

module.exports = new MailService();
