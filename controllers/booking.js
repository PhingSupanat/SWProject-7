const Booking = require('../models/Booking');
const RentalCar = require('../models/RentalCar');

//@desc     Get all appointment
//@route    Get /api/v1/appointments
//@access   Public

exports.getBookings = async (req, res, next) => {
    let query;

    //General users can see only their appointments!
    if(req.user.role !== 'admin'){
        query=Booking.find({user:req.user.id}).populate({
            path: 'rentalcar',
            select: 'name province tel'
        });
    } else{ //If you are an admin, you can see all!
        if (req.params.rentalcarId){
            console.log(req.params.rentalcarId);
            query = Booking.find({rentalcar: req.params.rentalcarId}).populate({
                path: 'rentalcar',
                select: 'name province tel'
            });
        } else query = Booking.find().populate({
            path: 'rentalcar',
            select: 'name province tel'
        });
    }
    try {
        const bookings = await query;

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch(err){
        console.log(err);
        return res.status(500).json({sucess: false, message: "Cannot find Booking"});
    }
};

//@desc     Get single appointment
//@route    Get /api/v1/appointments/:id
//@access   Public

exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'rentalcar',
            select: 'name description tel'
        });

        if(!booking){
            return res.status(404).json({sucess: false, message: `No booking with the id of ${req.params.id}`});
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: 'Cannot find Booking'});
    }
};

//@desc     Add appointment
//@route    POST /api/v1/hospitals/:hospitalId/appointment
//@access   Private

exports.addBooking = async (req, res, next) => {
    try {
        req.body.rentalcar = req.params.rentalcarId;

        const rentalcar = await RentalCar.findById(req.params.rentalcarId);

        if(!rentalcar){
            return res.status(404).json({success: false, message: `No rental car with the id of ${req.params.rentalcarId}`});
        }

        //add user id to req.body
        req.body.user = req.user.id;

        //Check for existed appointment
        const existedBookings = await Booking.find({user: req.user.id});

        //If the user is not an admin, they can only create 3 appintment.
        if(existedBookings.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success: false, message: `The user with ID ${req.user.id} has already made 3 bookings`});
        }

        const booking = await Booking.create(req.body);

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({sucess: false, message: error.message});
    }
};

//@desc     Update appointment
//@route    PUT /api/v1/appointments/:id
//@access   Private

exports.updateBooking = async (req ,res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({sucess: false, message: `No booking with the id of ${req.params.id}`});
        }
        
        //Make sure user is the appointment owner
        if(booking.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this booking`});
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            sucess: true,
            data: booking
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot update Booking"});
    }
};

//@desc     Delete appointment
//@route    DELETE /api/v1/appointments/:id
//@access   Private

exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if(!booking){
            return res.status(404).json({success: false, message: `No booking with the id of ${req.params.id}`});
        }
        
        //Make sure user is the appointment owner
        if(booking.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this booking`});
        }

        await booking.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: 'Cannot delete Booking'});
    }
};