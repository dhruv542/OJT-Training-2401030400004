const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const path = require("path");
const User = require('./models/User');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));
app.use(
    session({
        secret: "task5SecretKey",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 2 }
    })
);

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/my_database")
    .then(() => {
        console.log("✅ MongoDB Connected Successfully");
    })
    .catch((err) => {
        console.log("❌ MongoDB Connection Error:", err);
    });

// Using User model from models/User.js

function requireAuth(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    return res.redirect("/");
}

// Routes
app.get("/", (req, res) => {
    if (req.session.userId) {
        return res.redirect("/dashboard");
    }
    res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "register.html"));
});

app.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, userName, password } = req.body;

        if (!firstName || !lastName || !userName || !password) {
            return res.send(
                `<h2>All fields are required</h2><a href="/register">Try Again</a>`
            );
        }

        const existingUser = await User.findOne({ userName });
        if (existingUser) {
            return res.send(
                `<h2>Username already exists</h2><a href="/register">Try Again</a>`
            );
        }

        const user = new User({
            firstName,
            lastName,
            userName,
            password
        });

        await user.save();
        res.send(`
            <h2>Registration Successful</h2>
            <a href="/">Go To Login</a>
        `);
    } catch (error) {
        console.log(error);
        res.send("Registration Failed");
    }
});

app.post("/dashboard", async (req, res) => {
    try {
        const { userName, password } = req.body;
        const user = await User.findOne({ userName });

        if (!user) {
            return res.send(
                `<h2>Invalid Username or Password</h2><a href="/">Try Again</a>`
            );
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.send(
                `<h2>Invalid Username or Password</h2><a href="/">Try Again</a>`
            );
        }

        req.session.userId = user._id;
        req.session.userName = user.userName;
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
        res.send("Login Failed");
    }
});

app.get("/dashboard", requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

// API: current user info (protected)
app.get('/api/me', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post("/profile", requireAuth, async (req, res) => {
    try {
        const { firstName, lastName, newPassword } = req.body;
        const user = await User.findById(req.session.userId);

        if (!user) {
            req.session.destroy(() => {});
            return res.redirect("/");
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (newPassword) {
            user.password = newPassword; // will be hashed by model pre-save
        }

        await user.save();
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
        res.send("Profile update failed");
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server Running at http://localhost:${PORT}`);
});