'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
	  validate: {
		  notEmpty: {
			  msg: "Please enter a title for the course name"
			}
		}
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false,
		validate: {
		  notEmpty: {
			  msg: "Please enter a description for the course"
			}
		}
    },
      estimatedTime: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      materialsNeeded: {
        type: Sequelize.STRING,
        allowNull: true,
      },
  }, { sequelize });

  Course.associate = (models) => {
    Course.belongsTo(models.User, { 
      foreignKey: {
        fieldName: 'userId', 
        allowNull: false,
          },
      });
  };

  return Course;
};