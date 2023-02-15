const Services = require('../constants/services');
const { body, validationResult } = require('express-validator');

const validator = (services) => {
  switch (services) {
    case Services.register:
      return [
        body('username').notEmpty(),
        body('email').isEmail().notEmpty(),
        body('password')
          .notEmpty()
          .isLength({ min: 8 })
          .withMessage('must be at least 8 chars long'),
      ];

    case Services.login:
      return [
        body('email').isEmail().notEmpty().exists(),
        body('password').notEmpty().exists(),
      ];
  }
};

const validation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { validator, validation };
