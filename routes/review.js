const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync= require("../utlis/wrapAsync.js");
const Review = require("../models/review.js");
const {validateReview, isLoggedIn, isReviewAuthor}=require("../middleware.js");


const reviewcontroller = require("../controllers/reviews.js");


// Reviews
// post Review route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewcontroller.createReview));



// Delete Review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewcontroller.destroyReview));

module.exports = router;