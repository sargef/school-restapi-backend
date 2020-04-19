'use strict';
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
     allowNull: false,
     autoIncrement: true,
     primaryKey: true,
     type: DataTypes.INTEGER
   },
    title: {
     type: DataTypes.STRING,
     allowNull: false,
     validate: {
       notNull: {
         msg: 'Please provide a title!',
       },
       notEmpty: {
         msg: 'Please provide a title!',
       },
     },
   },
    description: {
     type: DataTypes.TEXT,
     allowNull: false,
     validate: {
       notNull: {
         msg: 'Please provide a description!',
       },
       notEmpty: {
         msg: 'Please provide a description!',
       },
     },
   },
    estimatedTime: {
      type: DataTypes.STRING,
      allowNull: true,
   },
    materialsNeeded: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    imagePic: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {});
  Course.associate = function(models) {
    Course.belongsTo(models.User, {
    foreignKey: {
     fieldName: 'userId',
     allowNull: false,
    },
   });
  };
  return Course;
};
