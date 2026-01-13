const Razorpay = require("razorpay");
const crypto = require("crypto");
const Listing = require("../models/listing");
const Booking = require("../models/Booking");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Render checkout page
module.exports.renderCheckout = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return res.redirect("/listings");

    res.render("payment/checkout", {
      listing,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/listings");
  }
};

// Create Razorpay order
module.exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) return res.status(400).json({ error: "Invalid amount" });

    const order = await razorpay.orders.create({
      amount: parseInt(amount),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order creation failed" });
  }
};

// Verify payment
module.exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, listingId, amount } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !listingId)
      return res.status(400).json({ success: false, error: "Missing payment details" });

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ success: false, error: "Invalid payment signature" });

    // Save booking
    const booking = await Booking.create({
      listing: listingId,
      user: req.user._id,
      amount: amount / 100,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });

    res.json({ success: true, bookingId: booking._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Payment verification failed" });
  }
};
