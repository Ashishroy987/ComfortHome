const express = require("express");
const router = express.Router();
const multer = require("multer");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");
const listingController = require("../controllers/listings");

// Cloudinary storage
const { storage } = require("../cloudConfig");
const upload = multer({ storage });

// INDEX & CREATE
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("image"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

// NEW FORM
router.get("/new", isLoggedIn, listingController.renderNewForm);

// SHOW, UPDATE & DELETE
router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("image"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );

// EDIT FORM
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
