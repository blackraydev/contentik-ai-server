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
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    text: {
      type: DataTypes.STRING(2000),
    },
    contentType: {
      type: DataTypes.STRING,
    },
    targetAudience: {
      type: DataTypes.STRING,
    },
    keywords: {
      type: DataTypes.STRING,
    },
    style: {
      type: DataTypes.STRING,
    },
    tone: {
      type: DataTypes.STRING,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING(2000),
    },
  });

  return Content;
};
