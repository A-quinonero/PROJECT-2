var express = require('express');
var router = express.Router();
var bcrypt = require("bcryptjs");
var bcryptSalt = 10;

const User = require("../models/User.js");

// estas dos líneas le dicen a router que por favor use userIsNotLoggedIn
const userIsNotLoggedIn = require("../middlewares/auth-mid").userIsNotLoggedIn
router.use((req, res, next)=> userIsNotLoggedIn(req, res, next));

router.get("/signup", (req, res, next) => {
    // renderizar las vistas de signup
    res.render("sign-up.hbs")
})


// podeis quitar los .hbs y funciona igual.
router.post("/signup", (req, res, next)=>{
    const {username, password, repeatPassword} = req.body

    if(!username || !password){
        res.render("sign-up.hbs", {errorMessage:"Please fill all the fields"})
        return;
    }

    if(password !== repeatPassword){
        res.render("sign-up.hbs", {errorMessage: "Passwords do not match"})
        return;
    }

    User.findOne({username})
    .then(user => {
        if (user){
            res.render("sign-up", {errorMessage: "The userName already exists"})
            return;
        }

        const salt = bcrypt.genSaltSync(bcryptSalt)
        const hashPass = bcrypt.hashSync(password, salt)
        User.create({username, "password": hashPass})
        .then((user)=>{
            
            req.session.currentUser = user;
            res.redirect("/priv")
        })
        .catch(err => console.log("Error at posting singup: " + err))
    })
    .catch(err => console.log("error finding the user in DB: " + err))

})

router.get("/login", (req, res, next)=>{
    // renderizar las vistas de login
    res.render("log-in.hbs")
})

router.post("/login", (req, res, next)=>{
    const { username, password } = req.body;

    if(username === "" || password === ""){
        res.render("log-in", {errorMessage: "Please, fill all the fields"})
    }

    User.findOne({ username })
        .then(user => {
            if (!user) {
                res.render("log-in", {
                    errorMessage: "There is no user with that username"
                })
            }

            //bcrypt.compareSync(contraseñaNormal, contraseñaHassheda)

            if (bcrypt.compareSync(password, user.password)) {
                req.session.currentUser = user;
                res.redirect("/priv/")
            }

            else {
                res.render("log-in", {
                    errorMessage: "Incorrect password"
                })
            }

        })
        .catch(err => console.log("error finding the user: " + err))

    
})

module.exports = router;
