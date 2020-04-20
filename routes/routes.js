'use strict';

// import modules
const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

const app = express();

const db = require('../models');
const User = db.User;
const Course = db.Course;

// Authentication function for Users in database
const authenticateUser = (req, res, next) => {
  let message = '';
  const credentials = auth(req);

  if (credentials) {
    User.findOne({
        where : {
          emailAddress : credentials.name
        }
      }).then(user => {
        if (user) {
          const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
          if (authenticated) {
            console.log(`Authentication successful for user with email Address: ${user.emailAddress}`);
           if (req.originalUrl === '/api/users') {
             req.body.id = user.id;
           } else if (req.originalUrl.substring(0, 12) === '/api/courses') {
             req.body.userId = user.id;
           }
          next();
          } else {
            console.log(`Authentication failure for email address: ${user.emailAddress}`);
            res.status(401).json();
            message = 'Access Denied';
          }
        } else {
          console.log( `User not found for: ${credentials.name}`);
          res.status(401).json();
          message = 'Access Denied';
        }
      })
    } else {
      res.status(401).json();
      message = 'Access Denied';
    }
}

// Get Users route & exclude storing password, createdAt and updatedAt
router.get('/users', authenticateUser, async (req, res) => {
  const user = await User.findByPk(req.body.id, {
    attributes: ['id', 'firstName', 'lastName', 'emailAddress']
  });
  res.status(200).json(user);
});

// Create new users route after verfiying all values exist, throw validation error messages to user if is null
router.post('/users', async(req, res, next) => {
  try {
       await User.create(req.body)
       res.location('/');
       res.status(201).end();
  } catch(err) {
    if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
      const errorMessages = err.errors.map(error => error.message);
      res.status(400).json({error: errorMessages});
    } else {
      return next(err);
    }
  }
})

// Route to get all courses while including users credentials and exluding created/updated time attributes
router.get('/courses', async (req, res, next) => {
  const courses = await Course.findAll( {
    include : [{
        model : User,
        as: 'User',
        attributes: ['id', 'firstName', 'lastName']
      }
    ],
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  });
  res.json(courses)
     .status(200).end();
});

// Route to get courses by id, including user information and exluding time attributes.
router.get('/courses/:id', async (req, res, next) => {
  const course = await Course.findByPk(req.params.id, {
    include : [{
        model : User,
        as: 'User',
        attributes: ['id', 'firstName', 'lastName']
      }
    ],
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  });
  if (course === null) {
    res.status(404).json({message: "This course does not exist"});
  } else {
    res.json(course)
       .status(200).end();
  }
});

// Create new course route while authenticating user has authority to create
router.post('/courses', authenticateUser, async (req, res, next) => {
   try {
     const course = await Course.create(req.body);
     res.location(`/api/courses/${course.id}`);
     res.status(201).end();
   } catch(err) {
     if (err.name === "SequelizeValidationError") {
       const errorMessages = err.errors.map(error => error.message);
       res.status(400).json({ error: errorMessages });
     } else {
       return next(err);
     }
   }
});

// Updating courses route. Authenticate user and allow if verified
router.put('/courses/:id', authenticateUser, async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id)
    if (req.body.userId === course.userId) {
      if (req.body.title && req.body.description) {
        if (course === null) {
          res.status(404).json();
          message = "The course you are looking for does not exist!"
        } else {
          await course.update(req.body);
          res.status(204).end();
        }
      } else if (!req.body.title || !req.body.description) {
        res.status(400).json({
          error: 
          ["You must include a title and a description!"]
        })
      }
    } else {
      res.status(403).json();
      message = "Forbidden" 
    }
  } catch(err) {
    return next(err);
  }
});

// Delete courses route while authenticating user credentials to delete
router.delete('/courses/:id', authenticateUser, async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (req.body.userId === course.userId) {
      if (course === null) {
        res.status(404).json({ message: "This course does not exist" });
      } else {
        await course.destroy();
        res.status(204).end();
      }
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  } catch(err) {
    return next(err);
  }
})

module.exports = router;
