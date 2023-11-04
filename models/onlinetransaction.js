'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class onlineTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  onlineTransaction.init({
    custId: DataTypes.INTEGER,
    location: DataTypes.TEXT,
    remarks: DataTypes.TEXT,
    status: DataTypes.STRING,
    paymentFile: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'onlineTransaction',
  });
  return onlineTransaction;
};