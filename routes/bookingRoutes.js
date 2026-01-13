const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const { isLoggedIn } = require("../middleware");

// ===================== BOOKING CONFIRMATION =====================
router.get("/confirmation/:id", isLoggedIn, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("listing")
      .populate("user");

    if (!booking) {
      req.flash("error", "Booking not found");
      return res.redirect("/listings");
    }

    res.render("booking/confirmation", { booking });
  } catch (err) {
    console.error("Error fetching booking:", err);
    req.flash("error", "Something went wrong while fetching booking");
    return res.redirect("/listings");
  }
});

module.exports = router;
