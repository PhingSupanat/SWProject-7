const mongoose = require('mongoose');
const RentalCar = require('./RentalCar');

const BookingSchema = new mongoose.Schema({
    bookingDate: {
        type: Date,
        required: [true, 'Please select booking date']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    rentalcar: {
        type: mongoose.Schema.ObjectId,
        ref: 'RentalCar',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);