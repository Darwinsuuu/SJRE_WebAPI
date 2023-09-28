'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  cart.init({
    custId: DataTypes.INTEGER,
    prodId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    active: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'cart',
  });
  return cart;
};