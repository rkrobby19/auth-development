const bcrypt = require('bcryptjs');
const { User } = require('../models');
const jwt = require('jsonwebtoken');

module.exports = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const saltRounds = 10;
      let hashPassword = bcrypt.hashSync(password, saltRounds);

      let user = await User.create({ username, email, password: hashPassword });

      res.status(201).send({ status: 'success', data: user });
    } catch (error) {
      res.send({ status: 'Error', message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      let user = await User.findOne({ where: { email } });

      // * User not found
      if (!user) {
        return res.status(404).send({
          message: 'User not found',
        });
      }

      // * Wrong password
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).send({
          message: 'Incorrect Password',
        });
      }

      const payload = {
        username: user.username,
        email: user.email,
      };

      const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: '1d',
      });

      res
        .status(200)
        .send({ message: 'Login Success', token: `Bearer ${token}` });
    } catch (error) {
      res.send({ status: 'Error', message: error.message });
    }
  },

  profile: (req, res) => {
    const { id, username, email } = req.user;
    const user = { id, username, email };
    res.send(user);
  },
};
