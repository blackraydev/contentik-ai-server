const nodemailer = require('nodemailer');
const getActivationTemplate = require('../templates/activation-template');
const getPasswordResetTemplate = require('../templates/password-reset-template');

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
      subject: 'Подтверждение регистрации | Contentik AI',
      text: '',
      html: getActivationTemplate(link),
    });
  }

  async sendResetPasswordMail(to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Восстановление доступа | Contentik AI',
      text: '',
      html: getPasswordResetTemplate(link),
    });
  }
}

module.exports = new MailService();
