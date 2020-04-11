'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
	  	  validate: {
		  notEmpty: {
			  msg: "Please enter your first name"
			}
		}
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
	  	  validate: {
		  notEmpty: {
			  msg: "Please enter your last name"
			}
		}
    },
    emailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
		  validate: {
		  notEmpty: {
			  msg: "Please enter your email address"
            },
            isEmail: true
		 }
      },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
		  validate: {
		  notEmpty: {
			  msg: "Please enter a password"
			}
		}
      }
  }, { sequelize });

  User.associate = (models) => {
    User.hasMany(models.Course, { 
      foreignKey: {
        fieldName: 'userId', 
        allowNull: false,
          },
      });
  };

  return User;
};