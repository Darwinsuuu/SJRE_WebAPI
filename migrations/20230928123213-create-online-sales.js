'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('onlineSales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      OLTransID: {
        type: Sequelize.STRING
      },
      prodId: {
        type: Sequelize.INTEGER
      },
      currentPrice: {
        type: Sequelize.FLOAT
      },
      currentSale: {
        type: Sequelize.FLOAT
      },
      currentComputedPrice: {
        type: Sequelize.FLOAT
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      totalPrice: {
        type: Sequelize.FLOAT
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
    await queryInterface.dropTable('onlineSales');
  }
};