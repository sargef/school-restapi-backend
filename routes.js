'use strict';
// Import required modules
const express = require('express');
const bcryptjs = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const auth = require('basic-auth');
const User = require('./models').User;
const Course = require('./models').Course;

const router = express.Router();

// Handler function to wrap each route
function asyncHandler(cb) {
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(err) {
        next(err);
    }
  }
}

// Authentication function for users
const authenticateUser = async (req, res, next) => {
  let message = null;
  const users = await User.findAll();
  const credentials = auth(req);

  if (credentials) {
    const user = users.find(u => u.emailAddress === credentials.name);
    if (user) {
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
      if (authenticated) {
        console.log(`Authentication successful for email address: ${user.emailAddress}`);
        req.currentUser = user;
      } else {
        message = `Authentication failure for email address: ${credentials.name}`;
      }
    } else {
      message = `Email address not found for: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }
    if (message) {
      console.warn(message);
      res.status(401).json({ message: 'Access Denied' });
    } else {
      next();
    }
};

// Get Users route & exclude storing password, createdAt and updatedAt
router.get('/users', authenticateUser, asyncHandler(async(req, res) => {  
  const authenticatedUser = req.currentUser;
  const user = await User.findByPk(authenticatedUser.id, {
    attributes: {
      exclude: ['password', 'createdAt','updatedAt']
      }
  });
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(400).json({ message: 'Sorry, user not found!' });
  }
}));

// Create new users route after verfiying all values exist, throw error message to user if is null
router.post('/users', [
      check('firstName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "firstName"'),
      check('lastName')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "lastName"'),
      check('emailAddress')
        .exists({ checkNull: true, checkFalsy: true, checkisEmail: true })
        .withMessage('Please provide a value for "email"')
        .isEmail({ checkisEmail: true})
        .withMessage('Please provide a valid email'),
      check('password')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "password"')
    ], asyncHandler(async(req, res) => {
      const errors = validationResult (req);

      if(!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({ errors: errorMessages });
      }
  const user = req.body;
  user.password = bcryptjs.hashSync(user.password);
  await User.create(req.body);
  return res.status(201).end();
}));

// Get all courses route
router.get('/courses', asyncHandler(async(req, res) => {
    const courses = await Course.findAll({
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      },
      include: [{ model: User, attributes: {
        exclude: ['password', 'createdAt', 'updatedAt']
      }}]
    });
    res.status(200).json(courses);
}));

// get Individual courses route
router.get('/courses/:id', asyncHandler(async(req, res) => {
  const course = await Course.findByPk(req.params.id, {
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    },
    include: [{ model: User, attributes: {
      exclude: ['password', 'createdAt', 'updatedAt']
    }}]
  });
  res.status(200).json(course);
}));

// Create new courses to the database, while checking all required fields are entered.
router.post('/courses', [
      check('userId')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a user "Id"'),
      check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "title"'),
      check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for " course description"')
], authenticateUser, asyncHandler(async(req, res) => {
  const errors = validationResult (req);
  if(!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
    const createCourse = await Course.create(req.body);
    res.status(201).end();
}));

// Update individual courses route
router.put('/courses/:id', [
  check('userId')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a user "Id"'),
      check('title')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "title"'),
      check('description')
        .exists({ checkNull: true, checkFalsy: true })
        .withMessage('Please provide a value for "course description"')
], authenticateUser, asyncHandler(async(req, res) => {
  const errors = validationResult (req);
  if(!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(403).json({ errors: errorMessages });
  }
    const authenticatedUser = req.currentUser;
    const course = await Course.findByPk(req.params.id);
    if (authenticatedUser.id = course.userId) {
      await course.update(req.body);
      res.status(204).end();
    } else {
      res.status(403).json({ message: 'You can only edit this course if you have authorized access credentials' });
    }
}));

// Delete individual courses
router.delete('/courses/:id', authenticateUser, asyncHandler(async(req, res) => {
  const authenticatedUser = req.currentUser;
  const course = await Course.findByPk(req.params.id);
  if (course) {
    if (authenticatedUser.id === course.userId) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({ message: 'You can only delete this course if you have authorized access credentials' });
    } 
  } else {
      res.status(400).json();
  }
}));

module.exports = router;
