'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class onlineSales extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  onlineSales.init({
    OLTransID: DataTypes.STRING,
    prodId: DataTypes.INTEGER,
    currentPrice: DataTypes.FLOAT,
    currentSale: DataTypes.FLOAT,
    currentComputedPrice: DataTypes.FLOAT,
    quantity: DataTypes.INTEGER,
    totalPrice: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'onlineSales',
  });
  return onlineSales;
};