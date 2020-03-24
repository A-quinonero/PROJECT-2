var express = require("express");
var router = express.Router();

const User = require("../models/User.js");
const Product = require("../models/Product.js");
const uploadCloud = require("../config/cloudinary.js");
const userIsLoggedIn = require("../middlewares/auth-mid").userIsLoggedIn;
router.use((req, res, next) => userIsLoggedIn(req, res, next));

router.get("/", async (req, res, next) => {
  const myId = req.session.currentUser._id;
  const userLog = req.session.currentUser;
  // Necesito hacer el populate para que se vean la información del todoList.

  const myUserHave = await User.findOne({ _id: myId }).populate("haveList");
  const myUserWant = await User.findOne({ _id: myId }).populate("wantList");

  res.render("priv.hbs", { userLog, myUserHave, myUserWant });
});

router.get("/create-have", (req, res, next) => {
  const userLog = req.session.currentUser;
  //el get solo tiene que renderizar la vista
  res.render("create-have.hbs", { userLog });
});

router.post(
  "/create-have",
  uploadCloud.single("photo"),
  async (req, res, next) => {
    const userId = req.session.currentUser._id;
    const { title, description, category } = req.body;
    const imgPath = req.file.url;
    const imgName = req.file.originalname;
    const newProduct = await Product.create({
      title,
      description,
      category,
      creator: userId,
      imgPath,
      imgName
    });

    await User.updateOne(
      { _id: userId },
      { $push: { haveList: newProduct._id } }
    );

    res.redirect("/priv/");
  }
);

//filter de categories
router.post("/categories", async (req, res, next) => {
  const userLog = req.session.currentUser;

  const { category } = req.body;

  const filterCategory = await Product.find({ category });

  res.render("discover", { products: filterCategory, userLog });
});

router.get("/discover", (req, res, next) => {
  const userLog = req.session.currentUser;

  Product.findRandom(
    { creator: { $ne: req.session.currentUser._id } },
    {},
    { limit: 9999999 },
    function(err, randomProducts) {
      if (!err) {
        console.log(typeof randomProducts);
        res.render("discover", { products: randomProducts, userLog });
      }
    }
  );
});

router.get("/product-details", (req, res, next) => {
  const userLog = req.session.currentUser;
  res.render("product-details.hbs", { userLog });
});
router.get("/details/:id", async (req, res, next) => {
  const userLog = req.session.currentUser;
  const { id } = req.params;
  let detailProduct = await Product.findById(id);
  console.log(detailProduct);

  res.render("product-details.hbs", { detailProduct, userLog });
});

router.get("/notifications", async (req, res, next) => {
  try{
  const userLog = req.session.currentUser;
  const likeList = userLog.likeList;

    const anAsyncFunction = async obj => {
      let user = await User.findById(obj.userwhoLikes);
      let product = await Product.findById(obj.productLiked);
     
      return {user, product}
    }

    const getData = async () => {
      return Promise.all(likeList.map(item => anAsyncFunction(item)))
    }
    getData().then(fullLikeList => {

      res.render("notifications.hbs", { fullLikeList});
    })

}catch(err){
  console.log(err)
  next(err)
}
});

router.get("/want/:id", async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;
  await User.updateOne({ _id: userId }, { $push: { wantList: id } });
  let productSelected = await Product.findById(id);
  let creatorProduct = await User.findByIdAndUpdate(productSelected.creator, {
    $push: { likeList: { userwhoLikes: userId, productLiked: id } }
  });
  res.redirect("/priv");
});

router.get("/delete-have/:_id", async (req, res, next) => {
  const { _id } = req.params;

  await Product.findOneAndDelete({ _id });

  res.redirect("/priv/");
});

router.get("/delete-want/:id", async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;
  await User.updateOne({ _id: userId }, { $pull: { wantList: id } });

  res.redirect("/priv");
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
