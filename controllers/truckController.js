const Truck = require('../models/truckModel');
const Admin = require('../models/adminModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middleware/CatchAsyncErrors');
const cloudinary = require('../config/cloudinary');
const containerAssignModel = require('../models/containerAssignModel');
const schoolModel = require('../models/schoolModel');

// create a new truck
exports.createTruck = catchAsyncError(async (req, res, next) => {
  req.body.admin = req.user.id;
  let images = req.body.images;
  let newImages = [];
  for (let i = 0; i < images.length; i++) {
    const { public_id, url } = await cloudinary.uploader.upload(images[i], {
      folder: 'tomper-wear',
    });
    newImages.push({ public_id, url });
  }
  req.body.images = [...newImages];
  const users = {
    name: req.body.driver_name,
    email: req.body.driver_email,
    mobile: req.body.driver_number,
    privilege: 'SUPER',
    password: req.body.driver_password,
    cooker: false,
    container: false,
    truck: true,
    school: false,
    kitchen: false,
    fcm: ''
  }
  const user =  await Admin.create(users);
  const truck = await Truck.create(req.body);
  res.status(200).json({
    success: true,
    data: truck,
  });
});

// update an existing truck
exports.updateTruck = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Truck Not Found', 400));
  }
  let truck = await Truck.findById(req.params.id);
  if (!truck) {
    return next(new ErrorHandler('Truck Not Found', 200));
  }
  let images = req.body.images;
  let newImages = [];
  for (let i = 0; i < images.length; i++) {
    if (typeof images[i] === 'string') {
      const { public_id, url } = await cloudinary.uploader.upload(images[i], {
        folder: 'tomper-wear',
      });
      newImages.push({ public_id, url });
    } else {
      newImages.push(images[i]);
    }
  }
  req.body.images = [...newImages];
  truck = await Truck.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    truck,
  });
});

// delete an existing truck
exports.deleteTruck = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Truck Not Found', 400));
  }
  const truck = await Truck.findById(req.params.id);
  if (!truck) {
    return next(new ErrorHandler('Truck Not Found', 200));
  }
  for (let i = 0; i < truck.images.length; i++) {
    await cloudinary.uploader.destroy(truck.images[i].public_id);
  }
  await truck.remove();
  res.status(200).json({
    success: true,
    message: 'Truck deleted',
  });
});

// send all truck details
exports.getAllTrucks = catchAsyncError(async (req, res) => {
  const { kitchenId } = req.query;
  const query = kitchenId ? { kitchenId } : {};
  const trucks = await Truck.find(query);
  const data = trucks.map((item, index) => {
    const {
      _id: id,
      truckId,
      images,
      description,
      driver_name,
      driver_number,
      driver_email,
      route,
      kitchenId
    } = item;
    const newItem = {
      id,
      truckId,
      image: images && images[0] && images[0].url ? images[0].url : "",
      description,
      driver_name,
      driver_number,
      driver_email,
      route,
      kitchenId
    };
    // console.log(newItem, "NNNNNNNNNNNNNN")
    return newItem;
  });
  res.status(200).json({
    success: true,
    data,
  });
});

// send only a single truck detaisl
exports.getSingleTruck = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Truck Not Found', 400));
  }
  const truck = await Truck.findById(req.params.id);
  if (!truck) {
    return next(new ErrorHandler('Truck Not Found', 200));
  }
  res.status(200).json({
    success: true,
    data: truck,
  });
});

// review a truck
exports.createTruckReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, truckId, name, email } = req.body;
  if (!rating || !comment || !truckId || !name || !email) {
    return next(new ErrorHandler('Request invalid', 400));
  }
  // creating a review
  const review = {
    name,
    email,
    rating: Number(rating),
    comment,
  };
  const truck = await Truck.findById(truckId);
  // check if the user already reviewed
  const isReviewed = truck.reviews.some((rev) => rev.email === email);
  // user already review: update the review
  // user gives new review: add new review and update the number of reviews
  if (isReviewed) {
    truck.reviews.forEach((rev) => {
      if (rev.email === email) {
        rev.name = name;
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    truck.reviews.push(review);
    truck.numberOfReviews = truck.reviews.length;
  }
  // update truck rating
  let avg = 0;
  truck.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  avg = avg / truck.reviews.length;
  truck.rating = avg;
  // save the truck
  await truck.save({ validateBeforeSave: false });
  // send success response
  res.status(200).json({
    success: true,
    message: 'Truck review created',
  });
});

// send all truck reviews
exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Truck not found', 400));
  }
  const truck = await Truck.findById(req.params.id);
  if (!truck) {
    return next(new ErrorHandler('Truck not found', 200));
  }
  const reviews = truck.reviews;
  res.status(200).json({
    success: true,
    data: reviews,
  });
});

// delete truck review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Truck not found', 400));
  }
  const { reviewId } = req.body;
  if (!reviewId) {
    return next(new ErrorHandler('Review not found', 400));
  }
  const truck = await Truck.findById(req.params.id);
  if (!truck) {
    return next(new ErrorHandler('Truck not found', 200));
  }
  const reviews = truck.reviews.filter(
    (rev) => rev._id.toString() !== reviewId.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  avg = avg / reviews.length;
  const rating = avg || 0;
  const numberOfReviews = reviews.length;
  await Truck.findByIdAndUpdate(
    req.params.id,
    {
      rating,
      numberOfReviews,
      reviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: true,
    }
  );
  res.status(200).json({
    success: true,
    message: 'Review deleted',
  });
});
