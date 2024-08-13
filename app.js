const env = require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const userroute = require("./routes/userRoute");
const adminroute = require("./routes/adminRoute");
const path = require("path");
const nocache = require("nocache");
const passport = require("passport");
const authRoutes = require("./routes/authRoute");
require("./controller/user/googleAuth");

const port = 3003;
const oneday = 1000 * 60 * 60 * 24;

// middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

app.use(
  session({
    secret: "secret-Key",
    resave: false,
    cookie: { maxAge: oneday },
    saveUninitialized: true,
  })
);
app.use(nocache());

// config
app.set("view engine", "ejs");

app.use(passport.initialize());
app.use(passport.session());
// route
app.use("/", userroute);
app.use("/admin", adminroute);
// app.use(authRoutes);

// server
app.listen(port, () => {
  console.log(`server created successfully in http://localhost:${port}`);
});
