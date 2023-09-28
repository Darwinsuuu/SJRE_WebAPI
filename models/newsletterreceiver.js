'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class newsletterReceiver extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  newsletterReceiver.init({
    email: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'newsletterReceiver',
  });
  return newsletterReceiver;
};