const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const haveSchema = new Schema({
    title: {type: String},
    image: {type: String},
    description: {type: String},
    category: {type: String, enum:['photography','drawings','handmade','wood']}
});

const Have = mongoose.model("Have", haveSchema);

module.exports = Have;