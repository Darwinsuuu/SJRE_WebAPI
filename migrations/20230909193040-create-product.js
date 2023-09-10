'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product: {
        type: Sequelize.STRING,
        unique: true
      },
      categoryId: {
        type: Sequelize.INTEGER
      },
      barcode: {
        type: Sequelize.STRING,
        unique: true
      },
      productDesc: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.FLOAT
      },
      sale: {
        type: Sequelize.FLOAT
      },
      computedPrice: {
        type: Sequelize.FLOAT
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      stockReminder: {
        type: Sequelize.INTEGER
      },
      imgFilename: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};