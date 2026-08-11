const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const clientSecretFile = require('../../client_secret_846891190750-7qs2jm2okb5se3mu916913ls7udq1e76.apps.googleusercontent.com.json');

passport.use(new GoogleStrategy({
    clientID: clientSecretFile.web.client_id,
    clientSecret: clientSecretFile.web.client_secret,
    callbackURL: clientSecretFile.web.redirect_uris[0]
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // Create new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          // First user could be made admin manually, or we just default to 'user'
          role: 'user'
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
