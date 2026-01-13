// ==========================
// APP CONFIG
// ==========================
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

// ==========================
// ROUTES
// ==========================
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");
const paymentRoutes = require("./routes/paymentRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// ==========================
// DATABASE
// ==========================
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/comforthome";

mongoose
  .connect(dbUrl)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err));

// ==========================
// VIEW ENGINE
// ==========================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ==========================
// MIDDLEWARE
// ==========================
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// ==========================
// SESSION CONFIG
// ==========================
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters long");
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: sessionSecret },
  touchAfter: 24 * 3600,
});

store.on("error", (e) => console.log("SESSION STORE ERROR", e));

app.use(
  session({
    store,
    name: "comforthome-session",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(flash());

// ==========================
// PASSPORT CONFIG
// ==========================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==========================
// GLOBAL VARIABLES FOR VIEWS
// ==========================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null; // ensures currUser is always available
  next();
});

// ==========================
// ROUTES
// ==========================
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/payment", paymentRoutes);
app.use("/booking", bookingRoutes); // Booking confirmation route fixed

// ==========================
// 404 HANDLER
// ==========================
app.use((req, res) => {
  res.status(404).render("listings/error", { message: "Page Not Found" });
});

// ==========================
// ERROR HANDLER
// ==========================
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err); // pass to default Express handler
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).render("listings/error", { message });
});

// ==========================
// SERVER
// ==========================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
