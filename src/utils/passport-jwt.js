// * Passport-jwt config
const passport = require('passport');
const { User } = require('../models');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;

passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    const data = await User.findOne({
      where: { username: jwt_payload.username },
    });
    if (data) {
      return done(null, data);
    }
    {
      return done(err, false);
    }
  })
);
