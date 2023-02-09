const express = require('express');
const bcrypt = require("bcryptjs")
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const path = require("path");
const app = express();

const UserModel = require("/models/User");
const mongoURI = 'mongodb://0.0.0.0:27017/sessions';
mongoose.connect(mongoURI);

const store = new MongoDBSession({
    uri: mongoURI,
    collection: 'mySessions',
});
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '/views'))
app.use(express.urlencoded({ extended: true }));

const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next()
    }
    else {
        res.redirect('/login');
    }
}

// middlewhare
app.use(session({
    secret: 'key that will sign cookie',
    resave: false,
    saveUninitialized: false,
    store: store,
})
);

app.get("/", (req, res) => {

    res.render("landing");
});

app.get("/login", (req, res) => {

    res.render("login.ejs");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
        return res.redirect("/login");
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.redirect("/login");
    }
    req.session.isAuth = true;
    res.redirect("/dashboard");
});

app.get("/register", (req, res) => {

    res.render("register");
});

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    let user = await UserModel.findOne({ email });

    if (user) {
        return res.redirect("/register");
    }

    const hashedPsw = await bcrypt.hash(password, 12)
    user = new UserModel({
        username,
        email,
        password: hashedPsw
    });
    await user.save();
    res.redirect("/login");
});

app.get("/dashboard", isAuth, (req, res) => {

    res.render("dashboard");
});
app.post("/logout", (req, res) => {
    res.render.destroy((err) => {
        if (err) throw err;
        res.redirect("/");
    });
});

app.listen(5000, console.log("App is listening to port http://localhost:5000")
);