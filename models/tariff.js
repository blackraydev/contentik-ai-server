const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tariff = sequelize.define('Tariff', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creations: {
      type: DataTypes.INTEGER,
    },
    edits: {
      type: DataTypes.INTEGER,
    },
    startAt: {
      type: DataTypes.DATE,
    },
    endAt: {
      type: DataTypes.DATE,
    },
    paymentMethodId: {
      type: DataTypes.STRING,
    },
    isExpired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return Tariff;
};
