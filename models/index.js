const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: false,
});

const User = require('./user')(sequelize);
const Token = require('./token')(sequelize);
const Content = require('./content')(sequelize);
const Tariff = require('./tariff')(sequelize);

User.hasMany(Token, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Content, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasOne(Tariff, { foreignKey: 'userId', onDelete: 'CASCADE' });

Token.belongsTo(User, { foreignKey: 'userId' });
Content.belongsTo(User, { foreignKey: 'userId' });
Tariff.belongsTo(User, { foreignKey: 'userId' });

sequelize
  .sync()
  .then(() => console.log('Database & tables synced!'))
  .catch((err) => console.log('Error: ' + err));

module.exports = {
  sequelize,
  User,
  Token,
  Content,
  Tariff,
};
