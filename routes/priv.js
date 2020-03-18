var express = require('express');
var router = express.Router();

const User = require("../models/User.js")
const Have = require("../models/Have.js");


//Estas dos líneas le dicen a router que por favor utilice el middelware userIsLoggedIn
const userIsLoggedIn = require("../middlewares/auth-mid").userIsLoggedIn
router.use((req, res, next)=> userIsLoggedIn(req, res, next));

router.get("/", async (req, res, next) => {

    const myId = req.session.currentUser._id

    // Necesito hacer el populate para que se vean la información del todoList. 

    const myUser = await User.findOne({"_id": myId}).populate("haveList")

    console.log(myUser)

    res.render("priv.hbs", myUser)
})
router.get("/create-have", (req, res, next) =>{
    //el get solo tiene que renderizar la vista
    res.render("create-have.hbs")
})

router.post("/create-have", async (req, res, next)=>{
    console.log(req.body)
    const {title, image, description, category} = req.body

    const newHave = await Have.create({title, image, description, category})

    const userId = req.session.currentUser._id

    await User.updateOne({_id: userId}, { $push: {haveList: newHave._id} })
    
    res.redirect("/priv/")

})

router.get("/delete-have/:_id", async (req, res, next)=>{
    const {_id} = req.params

    await Have.findOneAndDelete({_id})

    res.redirect("/priv/")
    
})


router.post("/logout", (req, res, next)=>{
    delete req.session.currentUser
    res.redirect("/")
})

module.exports = router;
