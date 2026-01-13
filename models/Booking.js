const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: [true, "Booking must belong to a listing"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Booking must have a user"],
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0, "Amount cannot be negative"],
  },
  paymentId: {
    type: String,
    required: [true, "Payment ID is required"],
  },
  orderId: {
    type: String,
    required: [true, "Order ID is required"],
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: Add index for faster queries by user or listing
bookingSchema.index({ user: 1 });
bookingSchema.index({ listing: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
