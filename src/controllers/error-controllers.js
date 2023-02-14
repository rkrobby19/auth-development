class UserValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UserValidationError';
    this.code = 400;
  }
}

module.exports = UserValidationError;
