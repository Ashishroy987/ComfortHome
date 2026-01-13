const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { isLoggedIn } = require("../middleware");

router.get("/checkout/:id", isLoggedIn, paymentController.renderCheckout);
router.post("/create-order", isLoggedIn, paymentController.createOrder);
router.post("/verify", isLoggedIn, paymentController.verifyPayment);

module.exports = router;
