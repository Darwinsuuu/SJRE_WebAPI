'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  product.init({
    product: DataTypes.STRING,
    categoryId: DataTypes.INTEGER,
    barcode: DataTypes.STRING,
    productDesc: DataTypes.STRING,
    price: {type: DataTypes.DECIMAL(10, 2)},
    sale: {type: DataTypes.DECIMAL(10, 2)},
    computedPrice: {type: DataTypes.DECIMAL(10, 2)},
    quantity: DataTypes.INTEGER,
    stockReminder: DataTypes.INTEGER,
    imgFilename: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'product',
  });
  return product;
};