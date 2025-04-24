const express = require('express');
const {getRentalCars, getRentalCar, createRentalCar, updateRentalCar, deleteRentalCar} = require('../controllers/rentalcars');

//Include other resource routers
const bookingRouter = require('./bookings');

const router = express.Router();

const {protect, authorize} = require('../middleware/auth');

//Re-route into other resource routers
router.use('/:rentalcarId/bookings/', bookingRouter);

router.route('/').get(getRentalCars).post(protect, authorize('admin'), createRentalCar);
router.route('/:id').get(getRentalCar).put(protect, authorize('admin'), updateRentalCar).delete(protect, authorize('admin'), deleteRentalCar);

module.exports=router;