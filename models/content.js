const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Content = sequelize.define('Content', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true,
    },
    mode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING(150),
    },
    description: {
      type: DataTypes.STRING(1000),
    },
    text: {
      type: DataTypes.STRING(10000),
    },
    contentType: {
      type: DataTypes.STRING(150),
    },
    targetAudience: {
      type: DataTypes.STRING(250),
    },
    keywords: {
      type: DataTypes.STRING(500),
    },
    style: {
      type: DataTypes.STRING(150),
    },
    tone: {
      type: DataTypes.STRING(150),
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING(32000),
    },
  });

  return Content;
};
