const Listing = require("../models/listing");

// SHOW ALL LISTINGS
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

// NEW LISTING FORM
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

// SHOW SINGLE LISTING
module.exports.showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings"); //  return added
    }

    res.render("listings/show", { listing });
};

// CREATE LISTING
module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// EDIT FORM
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings"); //  return added
    }

    res.render("listings/edit", { listing });
};

// UPDATE LISTING
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await listing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

// DELETE LISTING
module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};
