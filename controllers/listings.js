const Listing = require("../models/listing");

// Show all listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

// Render new listing form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Show a single listing
module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
};

// Create new listing
module.exports.createListing = async (req, res, next) => {
    try {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        // Handle image upload
        if (req.file) {
            newListing.image = {
                url: req.file.path,       // Cloudinary URL
                filename: req.file.filename // Cloudinary filename
            };
        }

        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};

// Render edit form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });
};

// Update listing
module.exports.updateListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

        // Replace image if a new one is uploaded
        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
            await listing.save();
        }

        req.flash("success", "Listing Updated");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
};

// Delete listing
module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    // Optional: delete image from Cloudinary
    // if (deletedListing.image && deletedListing.image.filename) {
    //     await cloudinary.uploader.destroy(deletedListing.image.filename);
    // }

    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};
