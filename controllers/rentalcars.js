const Booking = require("../models/Booking.js");
const RentalCar = require(`../models/RentalCar.js`);

exports.getRentalCars = async (req, res, next) => {
    try{
        let query;

        //Copy req.query
        const reqQuery = {...req.query};

        //Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        //Loop over remove fields and delete them from reqQuery
        removeFields.forEach(param=>delete reqQuery[param]);
        console.log(reqQuery);

        //Create query string
        let queryStr=JSON.stringify(req.query);
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`);
    
        query=RentalCar.find(JSON.parse(queryStr)).populate('bookings');

        //Select Fields
        if(req.query.select){
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        //Sort
        if(req.query.sort){
            const sortBy=req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else{
            query = query.sort('-createdAt');
        }

        //Pagination
        const page=parseInt(req.query.page, 10)||1;
        const limit=parseInt(req.query.limit, 10)||25;
        const startIndex=(page-1)*limit;
        const endIndex=page*limit;
        const total=await RentalCar.countDocuments();

        query=query.skip(startIndex).limit(limit);

        const rentalcars = await query;

        //Pagination result
        const pagination={};

        if(endIndex<total){
            pagination.next={
                page:page+1,limit
            }
        }

        if(startIndex>0){
            pagination.prev={
                page:page-1,limit
            }
        }
        
        res.status(200).json({success:true, count:rentalcars.length, pagination, data:rentalcars});

    } catch(err){
        res.status(400).json({success:false, msg: err});
    }
};

exports.getRentalCar = async (req, res, next) => {
    try{
        const rentalcar = await RentalCar.findById(req.params.id);

        if(!rentalcar){
            return res.status(400).json({success:false});
        }
        
        res.status(200).json({success:true, data:rentalcar});
    } catch(err){
        res.status(400).json({success:false});
    }

};

exports.createRentalCar = async (req, res, next) => {
    const rentalcar = await RentalCar.create(req.body);
    res.status(201).json({
        success:true,
        data:rentalcar
    });
};

exports.updateRentalCar = async (req, res, next) => {
    try{
        const rentalcar = await RentalCar.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators : true
        });

        if(!rentalcar){
            return res.status(400).json({success: false});
        }

        res.status(200).json({success:true, data: rentalcar});
    } catch(err){
        res.status(400).json({success:false});
    }
    
};

exports.deleteRentalCar = async (req, res, next) => {
    try{
        const rentalcar = await RentalCar.findById(req.params.id);

        if(!rentalcar){
            return res.status(404).json({success: false, message: `Rental Car not found with id of ${req.params.id}`});
        }
        await Booking.deleteMany({rentalcar: req.params.id});
        await RentalCar.deleteOne({ _id: req.params.id});

        res.status(200).json({success: true, data: {}});
    } catch(err){
        return res.status(400).json({success: false});
    }

};
