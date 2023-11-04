'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('onlineTransactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      custId: {
        type: Sequelize.INTEGER
      },
      location: {
        type: Sequelize.TEXT
      },
      remarks: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.STRING
      },
      paymentFile: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('onlineTransactions');
  }
};