const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userCollection = require("../../models/usermodel");

passport.use(
  new GoogleStrategy(
    {
      clientID:process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        let existingUser = await userCollection.findOne({
          googleId: profile.id,
        });
        if (existingUser) {
          return done(null, existingUser);
        }

        // If user doesn't exist, create a new one
        // const newUser = new userCollection({
        //   googleId: profile.id,
        //   name: profile.displayName,
        //   email: profile.emails[0].value,
        //   profilePhoto: profile.photos[0].value,
        //   isGoogleUser:true
        // });

        // await newUser.save();
        const guser = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePhoto: profile.photos[0].value,
          isGoogleUser: true,
        };
        await userCollection.create(guser);
        done(null, newUser);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userCollection.findById(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});

module.exports = passport;
