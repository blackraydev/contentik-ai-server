const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Token = sequelize.define('Token', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    refreshToken: {
      type: DataTypes.STRING(2500),
      allowNull: false,
    },
    deviceId: {
      type: DataTypes.STRING(250),
    },
  });

  return Token;
};
