const bcrypt = require('bcryptjs');
const Errors = require('../constants/errors');
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

    return user;
  };

  static verifyUser = async (email, password) => {
    const user = await this.getUserByEmail(email);

    // * User not found
    if (!user) {
      return Errors.UserNotFound;
    }
    // * Wrong password
    if (!bcrypt.compareSync(password, user.password)) {
      return Errors.IncorrectPassword;
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
};
