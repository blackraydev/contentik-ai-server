const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres', 'postgres', '', {
  host: 'localhost',
  dialect: 'postgres',
});

const User = require('./user')(sequelize);
const Token = require('./token')(sequelize);

User.hasMany(Token, { onDelete: 'CASCADE' });
Token.belongsTo(User);

sequelize
  .sync()
  .then(() => console.log('Database & tables created!'))
  .catch((err) => console.log('Error: ' + err));

module.exports = {
  sequelize,
  User,
  Token,
};
