const bcrypt = require('bcryptjs');
const Errors = require('../constants/errors');
const UserValidationError = require('../controllers/error-controllers');
const { User } = require('../models');

module.exports = class UserServices {
  static registerUser = async (username, email, password, refresh_token) => {
    // * Encrypt password
    const saltRounds = 10;
    const hashPassword = bcrypt.hashSync(password, saltRounds);

    const user = await User.create({
      username,
      email,
      password: hashPassword,
      refresh_token,
    });

    if (!user) {
      throw new Error(Errors.FailedToRegister);
    }

    return user;
  };

  static checkUser = async (username, email) => {
    let user = await this.getUserByUsername(username);
    if (user) {
      throw new UserValidationError(Errors.UsernameAlreadyExist);
    }
    user = await this.getUserByEmail(email);
    if (user) {
      throw new UserValidationError(Errors.EmailAlreadyExist);
    }
  };

  static verifyUser = async (email, password) => {
    const user = await this.getUserByEmail(email);

    // * User not found
    if (!user) {
      throw new UserValidationError(Errors.UserNotFound);
    }
    // * Wrong password
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UserValidationError(Errors.IncorrectPassword);
    }
    // * User verified
    return user;
  };

  static updateRefreshToken = async (email, refresh_token) => {
    const data = await User.update({ refresh_token }, { where: { email } });
  };

  static updateTokenVersion = async (email, token_version) => {
    const data = await User.update(
      {
        token_version,
      },
      {
        where: { email },
      }
    );
  };

  static getUserByEmail = async (email) => {
    const user = await User.findOne({ where: { email } });
    return user;
  };

  static getUserByUsername = async (username) => {
    const user = await User.findOne({ where: { username } });
    return user;
  };

  static getUserById = async (id) => {
    const user = await User.findOne({ where: { id } });
    return user;
  };
};
