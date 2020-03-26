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


router.get("/private-details", (req, res, next) => {
  const userLog = req.session.currentUser;
  res.render("private-details.hbs", { userLog });
});
router.get("/select/:id", async (req, res, next) => {
  const userLog = req.session.currentUser;
  const { id } = req.params;
  let selectProduct = await Product.findById(id);
  console.log(selectProduct);

  res.render("private-details.hbs", { selectProduct, userLog });
});


router.get("/product-details", (req, res, next) => {
  const userLog = req.session.currentUser;
  res.render("product-details.hbs", { userLog });
});
router.get("/details/:id", async (req, res, next) => {
  const userLog = req.session.currentUser;
  const { id } = req.params;
  let detailProduct = await Product.findById(id);
  //console.log(detailProduct);

  res.render("product-details.hbs", { detailProduct, userLog });
});



router.get("/notifications", async (req, res, next) => {
  try {
    const myId = req.session.currentUser._id;
    const userLog = req.session.currentUser;
    const likeList = userLog.likeList;
    let wantList = await User.findById(userLog._id).populate("wantList");
    console.log(`want want ${wantList.wantList}`)
    const anAsyncFunction = async obj => {
      let user = await User.findById(obj.userwhoLikes);
      let product = await Product.findById(obj.productLiked);
      console.log('USEEEEER:',user._id)
      return { user, product };
    };
    const getData = async () => {
      return Promise.all(likeList.map(item => anAsyncFunction(item)));
    };
    async function asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    }
    getData().then( async fullLikeList => {
      let matches = [];
      //const start = async () => {
        await asyncForEach(fullLikeList, async obj => {
          let likeListArr = obj.user.likeList;
          
          await fullLikeList.map(async function(item1) {
            //está cogiendo el id del creador propio.
            await wantList.wantList.map(async function(item2) {
              console.log('test',item1.user._id , item2.creator)
              if (item1.user._id.equals(item2.creator)) {
                matches.push({ userLikes: item1, iLike: item2 });
              }else{
                console.log('chorizo')
              }
            });
          });
          console.log('PROTEEEST:',matches);
        });
      //};
      res.render("notifications.hbs", { fullLikeList, userLog, matches});
    });
  } catch (err) {
    console.log(err);
    next(err);
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
router.get("/delacc-noti:id", async (req, res, next) => {

  const {id} = req.params;
  await User.findOneAndDelete({likeList: id});
  res.redirect("/notifications");
});

router.get("/delete-want/:id", async (req, res, next) => {
  const userId = req.session.currentUser._id;
  const { id } = req.params;
  await User.updateOne({ _id: userId }, { $pull: { wantList: id } });

  res.redirect("/priv");
});
//boton de delete o accept swap.


router.get("/logout", (req, res, next) => {
  delete req.session.currentUser;
  res.redirect("/");
});
router.get("/logout", (req, res, next) => {
  delete req.session.currentUser;
  res.redirect("/discover");
});

module.exports = router;
