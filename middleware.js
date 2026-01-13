const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError");
const { listingschema, reviewSchema } = require("./schema");

// ===================== LOGIN CHECK =====================
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }

  // Ensure req.user is available for controllers
  res.locals.currUser = req.user;
  next();
};

// ===================== SAVE REDIRECT URL =====================
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// ===================== OWNER CHECK =====================
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;

  if (!res.locals.currUser) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// ===================== LISTING VALIDATION =====================
module.exports.validateListing = (req, res, next) => {
  const { error } = listingschema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// ===================== REVIEW VALIDATION =====================
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// ===================== REVIEW AUTHOR CHECK =====================
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;

  if (!res.locals.currUser) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ExpressError(404, "Review not found");
  }

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
