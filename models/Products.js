const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const productsSchema = new Schema(
    {
    title: {type: String},
    imgPath: {type: String},
    imgName: {type: String},
    description: {type: String},
    category: {type: String, enum:['photography','drawings','handmade','wood']},
    creator: { type: Schema.Types.ObjectId, ref: 'User'}
},
{
    timestamps: true
}
);

const Products = mongoose.model("Products", productsSchema);

module.exports = Products;