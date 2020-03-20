var express = require("express");
var router = express.Router();

const User = require("../models/User.js");
const Products = require("../models/Products.js");
const uploadCloud = require("../config/cloudinary.js");


const userIsLoggedIn = require("../middlewares/auth-mid").userIsLoggedIn;
router.use((req, res, next) => userIsLoggedIn(req, res, next));

router.get("/", async (req, res, next) => {
  const myId = req.session.currentUser._id;
const userLog = req.session.currentUser
  // Necesito hacer el populate para que se vean la información del todoList.

  const myUserHave = await User.findOne({ _id: myId }).populate("haveList");
  const myUserWant = await User.findOne({ _id: myId }).populate("wantList");

  res.render("priv.hbs",{userLog, myUserHave, myUserWant})
});


  

router.get("/create-have", (req, res, next) => {
    const userLog = req.session.currentUser
  //el get solo tiene que renderizar la vista
  res.render("create-have.hbs",{userLog});
});

router.post(
  "/create-have",
  uploadCloud.single("photo"),
  async (req, res, next) => {
      
    const userId = req.session.currentUser._id;
    const { title, description, category } = req.body;
    const imgPath = req.file.url;
    const imgName = req.file.originalname;
    const newProduct = await Products.create({
      title,
      description,
      category,
      creator:userId,
      imgPath,
      imgName
    });

    await User.updateOne({ _id: userId }, { $push: { haveList: newProduct._id } });

    res.redirect("/priv/");
  }
);

router.get("/discover", (req, res, next) => {
    const userLog = req.session.currentUser
  Products.find({ creator: { $ne: req.session.currentUser._id } })
    .then(allTheHaveFromDB => {
        console.log(allTheHaveFromDB);
      res.render("discover", { have: allTheHaveFromDB, userLog });
    })
    .catch(error => {
      console.log("Error while getting the celebrity from the DB: ", error);
    });
});

router.get("/want/:id", async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;
  await User.updateOne({_id: userId}, { $push: {wantList: id} })

   res.redirect("/priv")
});

router.get("/delete-have/:_id", async (req, res, next) => {
  const { _id } = req.params;

  await Products.findOneAndDelete({ _id });

  res.redirect("/priv/");
});

router.get("/delete-want/:id", async (req, res, next) => {
    const userId = req.session.currentUser._id;
    const { id } = req.params;
    await User.updateOne({_id: userId}, { $pull: {wantList: id} })
  
    res.redirect("/priv")
  });
  router.get("/logout", (req, res, next) => {
    delete req.session.currentUser;
    res.redirect("/");
  });
  router.get("/logout", (req, res, next) => {
    delete req.session.currentUser;
    res.redirect("/discover");
  });

module.exports = router;
