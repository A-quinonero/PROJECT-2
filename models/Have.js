const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const haveSchema = new Schema(
    {
    title: {type: String},
    imgPath: {type: String},
    imgName: {type: String},
    description: {type: String},
    category: {type: String, enum:['photography','drawings','handmade','wood']},
},
{
    timestamps: true
}
);

const Have = mongoose.model("Have", haveSchema);

module.exports = Have;