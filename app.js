//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption")
const app = express();

const port = process.env.PORT || 3000;

// utils
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// establish connection with mongodb server local environment
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true })

// establish schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

// enable encryption plugin and specify the fields 
const secret = process.env.SECRET
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

// establish model
const User = mongoose.model('User', userSchema);

// routing
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render("login", { errMsg: "", username: "", password: "" });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post("/register", (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })
    newUser.save((err) => {
        !err ? res.render("secrets") : console.log(err)
    })
})

app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                console.log(foundUser.password)
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            }
        }
    });
});

app.listen(port, () => console.log(`Server started at port: ${port}`)
);