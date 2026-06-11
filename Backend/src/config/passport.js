const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/user.model");

// 1. Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({
          providerId: profile.id,
          provider: "google",
        });

        if (!user) {
          user = await User.findOne({ email });
          if (user) {
            user.provider = "google";
            user.providerId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              fullName: profile.displayName,
              email: email,
              provider: "google",
              providerId: profile.id,
              avatar: profile.photos[0].value,
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

// 2. GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails
          ? profile.emails[0].value
          : `${profile.username}@github.com`;

        let user = await User.findOne({
          providerId: profile.id,
          provider: "github",
        });

        if (!user) {
          user = await User.findOne({ email });
          if (user) {
            user.provider = "github";
            user.providerId = profile.id;
            await user.save();
          } else {
            user = await User.create({
              fullName: profile.displayName || profile.username,
              email: email,
              provider: "github",
              providerId: profile.id,
              avatar: profile._json.avatar_url,
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

// Serialize/Deserialize
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => done(null, user));
});
