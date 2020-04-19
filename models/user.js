'use strict';
const bcryptjs = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
     allowNull: false,
     autoIncrement: true,
     primaryKey: true,
     type: DataTypes.INTEGER
   },
    firstName: {
     type: DataTypes.STRING,
     allowNull: false,
     validate: {
       notNull: {
         msg: 'Please provide a first name!'
       },
       notEmpty: {
         msg: 'Please provide a first name!'
       },
     },
   },
    lastName: {
     type: DataTypes.STRING,
     allowNull: false,
     validate: {
      notNull: {
        msg: 'Please provide a last name!',
      },
      notEmpty: {
        msg: 'Please provide a last name!',
      },
     },
   },
    emailAddress: {
     type: DataTypes.STRING,
     allowNull: false,
     unique: {args: true, msg: 'This email address is already taken!'},
     validate: {
      notNull: {
        msg: 'Please provide an email address!',
      },
      notEmpty: {
        msg: 'Please provide an email address!',
      },
      isEmail: {
        msg: 'Please enter a valid email address!',
      },
     },
   },
    password: {
     type: DataTypes.STRING,
     allowNull: false,
     set(value) {
       if (value !== '' && value !== null) {
         this.setDataValue('password', bcryptjs.hashSync(value))
       }
     },
     validate: {
      notNull: {
        msg: 'Please provide a password!',
      },
      notEmpty: {
        msg: 'Please provide a password!',
      },
     },
   }
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Course, {
   foreignKey: {
     fieldName: 'userId',
     allowNull: false,
   },
 });
};
  return User;
};
