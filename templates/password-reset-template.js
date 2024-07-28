const getPasswordResetTemplate = (link) => `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #101012;
      color: #ffffff;
      font-family: Arial, sans-serif;
    "
  >
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <div
            style="
              max-width: 600px;
              margin: 0 auto;
              background-color: #101012;
              border-radius: 30px;
              padding: 25px;
            "
          >
            <div style="text-align: center; display: table; height: 40px; width: 100%">
              <div style="display: table-cell; vertical-align: middle">
                <div style="display: -webkit-inline-box; display: inline-flex; margin-bottom: 20px">
                  <img
                    src="https://contentik-ai.ru/img/logo.png"
                    alt="Contentik AI Logo"
                    width="24"
                    height="24"
                    style="
                      background: #24242a;
                      padding: 8px;
                      border-radius: 10px;
                      margin-bottom: -10px;
                    "
                  />
                  <h2 style="margin: 0; margin-left: 10px; margin-top: 5%; display: inline-block">
                    Contentik AI
                  </h2>
                </div>
              </div>
            </div>
            <p style="font-size: 14px; font-weight: 500; text-align: center">
              Нажмите на эту кнопку, чтобы перейти на страницу восстановления доступа к вашему
              аккаунту
            </p>
            <a
              href="${link}"
              style="
                display: inline-block;
                background: #ffffff;
                color: #000000;
                font-size: 14px;
                padding: 10px 15px;
                border-radius: 10px;
                text-decoration: none;
                margin-bottom: 20px;
              "
            >
              Восстановить доступ
            </a>
            <p style="color: #9696a5; font-size: 12px; text-align: center">
              Если вы не пытались восстановить доступ в сервисе Contentik, просто удалите это письмо
            </p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

module.exports = getPasswordResetTemplate;
