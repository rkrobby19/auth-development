const bcrypt = require('bcryptjs');
const { User } = require('../models');

module.exports = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const saltRounds = 10;
      let hashPassword = bcrypt.hashSync(password, saltRounds);

      let user = await User.create({ username, email, password: hashPassword });

      res.status(201).send({ status: 'success', data: user });
    } catch (error) {
      res.send(error.message);
    }
  },

  login: (req, res) => {
    res.send('login resp');
  },
};
