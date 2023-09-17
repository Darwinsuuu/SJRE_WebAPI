'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class customers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  customers.init({
    firstname: DataTypes.STRING,
    middlename: DataTypes.STRING,
    lastname: DataTypes.STRING,
    gender: DataTypes.STRING,
    mobileNo: DataTypes.STRING,
    region: DataTypes.STRING,
    province: DataTypes.STRING,
    city: DataTypes.STRING,
    barangay: DataTypes.STRING,
    subdivision: DataTypes.STRING,
    street: DataTypes.STRING,
    houseNo: DataTypes.STRING,
    zipCode: DataTypes.STRING,
    fullAddress: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'customers',
  });
  return customers;
};