const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  imgPath: {type: String},
  imgName: {type: String},
  haveList: [{ type: Schema.Types.ObjectId, ref: "Product"} ],
  wantList: [{ type: Schema.Types.ObjectId, ref: "Product"} ],
  likeList: [{userwhoLikes:{ type: Schema.Types.ObjectId, ref: "User"},
              productLiked:{ type: Schema.Types.ObjectId, ref: "Product"}}
 ],
  isUser: { type: Boolean, default: false } 
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;