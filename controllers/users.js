const User = require("../models/user");

// SIGNUP FORM
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

// SIGNUP
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to ComfortHome!");
            return res.redirect("/listings");
        });
    } catch (e) {
        next(e);
    }
};

// LOGIN FORM
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

// LOGIN
module.exports.login = (req, res, next) => {
    try {
        req.flash("success", "Welcome back to ComfortHome!");
        const redirectUrl = res.locals.redirectUrl || "/listings";
        return res.redirect(redirectUrl);
    } catch (err) {
        next(err);
    }
};

// LOGOUT
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You are logged out!");
        return res.redirect("/listings");
    });
};
