const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
    portfolio: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Portfolio' },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    stylist: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Stylist' },
    userName: { type: String, required: true },
    stylistName: { type: String, required: true },
    title: {type: String, required: true},
  });
  

const BookingModel = mongoose.model('Booking', bookingSchema);

module.exports = BookingModel;