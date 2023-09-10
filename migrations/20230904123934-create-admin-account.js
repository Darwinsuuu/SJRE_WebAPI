'use strict';
const bcryptjs = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admin_accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false
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


    bcryptjs.genSalt(10, function (err, salt) {
      bcryptjs.hash('somepasswordforadmin', salt, async function (err, hash) {
        await queryInterface.bulkInsert('admin_accounts', [
          {
            username: 'admin',
            password: hash,
            status: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);
      })
    })

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('admin_accounts');
  }
};