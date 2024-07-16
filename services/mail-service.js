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
      subject: 'Contentik | Подтверждение регистрации',
      text: '',
      html: `
        <html>
          <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600&display=swap" rel="stylesheet" />
            <meta name="color-scheme" content="light dark"> <meta name="supported-color-schemes" content="light dark"> 
          </head>
          <style>
            :root {
              color-scheme: light dark;
              supported-color-schemes: light dark;
            }

            .activateButton {
              background: #000000 !important;
              color: #FFFFFF !important;
              padding: 10px;
              border-radius: 10px;
              outline: none;
              border: none;
              cursor: pointer;
            }

            @media (prefers-color-scheme: dark) {
              .activateButton.dark {
                background: #FFFFFF !important;
                color: #000000 !important;
                padding: 10px;
                border-radius: 10px;
                outline: none;
                border: none;
                cursor: pointer;
              }

              h1,
              h2,
              p,
              span,
              a,
              b {
                color: #ffffff !important;
              }
            }
          </style>
          <body style="background-color: rgb(16, 16, 18); color: rgb(255, 255, 255); font-family: 'Rubik', sans-serif !important; padding: 50px">
            <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; width: 100%">
              <div style="display: flex; align-items: center; gap: 15px; width: 100%; margin-bottom: 15px">
                <img width="30" height="30" src="https://blackraydev.github.io/contentik-ai-landing/img/logo.png">
                <h2>Contentik</h2>
              </div>

              <p style="font-size: 12px; text-align: center">Нажмите на эту кнопку - и ваша почта будет подтверждена</p>
              <a href="${link}" style="margin-bottom: 20px; border-radius: 10px; outline: none; border: none; text-decoration: none">
                <button class="activateButton dark">Подтвердить почту</button>
              </a>

              <p style="color: rgb(150, 150, 165); font-size: 10px; text-align: center">Если вы не регистрировались в сервисе Contentik, просто
                удалите это письмо.</p>
            </div>
          </body>
        </html>
      `,
    });
  }
}

module.exports = new MailService();
