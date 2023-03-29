const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  owner: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
  title: String,
  description: String,
  experience: String,
  address: String,
  price: Number,
});

const PortfolioModel = mongoose.model('Portfolio', portfolioSchema);

module.exports = PortfolioModel;