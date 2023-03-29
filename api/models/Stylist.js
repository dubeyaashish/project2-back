const mongoose = require('mongoose');
const {Schema} = mongoose;
const StylistSchema = new mongoose.Schema({
    name: String,
    surname: String,
    email: {type:String, unique:true},
    password: String,
})

const StylistModel = mongoose.model('Stylist', StylistSchema);

module.exports = StylistModel;