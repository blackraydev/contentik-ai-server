const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres', 'postgres', '', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

const User = require('./user')(sequelize);
const Token = require('./token')(sequelize);
const Content = require('./content')(sequelize);

User.hasMany(Token, { onDelete: 'CASCADE' });
User.hasMany(Content, { onDelete: 'CASCADE' });

Token.belongsTo(User);
Content.belongsTo(User);

sequelize
  .sync()
  .then(() => console.log('Database & tables synced!'))
  .catch((err) => console.log('Error: ' + err));

module.exports = {
  sequelize,
  User,
  Token,
  Content,
};
