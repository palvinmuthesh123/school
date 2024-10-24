const Kitchen = require('../models/kitchenModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middleware/CatchAsyncErrors');
const cloudinary = require('../config/cloudinary');

// create a new kitchen
exports.createKitchen = catchAsyncError(async (req, res, next) => {
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
  const kitchen = await Kitchen.create(req.body);
  res.status(200).json({
    success: true,
    data: kitchen,
  });
});

// update an existing kitchen
exports.updateKitchen = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Kitchen Not Found', 400));
  }
  let kitchen = await Kitchen.findById(req.params.id);
  if (!kitchen) {
    return next(new ErrorHandler('Kitchen Not Found', 200));
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
  kitchen = await Kitchen.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    kitchen,
  });
});

// delete an existing kitchen
exports.deleteKitchen = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Kitchen Not Found', 400));
  }
  const kitchen = await Kitchen.findById(req.params.id);
  if (!kitchen) {
    return next(new ErrorHandler('Kitchen Not Found', 200));
  }
  for (let i = 0; i < kitchen.images.length; i++) {
    await cloudinary.uploader.destroy(kitchen.images[i].public_id);
  }
  await kitchen.remove();
  res.status(200).json({
    success: true,
    message: 'Kitchen deleted',
  });
});

// send all kitchen details
exports.getAllKitchens = catchAsyncError(async (req, res) => {
  const kitchens = await Kitchen.find();
  const data = kitchens.map((item, index) => {
    const {
      _id: id,
      kitchenId,
      images,
      description,
    } = item;
    const newItem = {
      id,
      kitchenId,
      image: images && images[0] && images[0].url ? images[0].url : "",
      description,
    };
    return newItem;
  });
  res.status(200).json({
    success: true,
    data,
  });
});

// send only a single kitchen detaisl
exports.getSingleKitchen = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Kitchen Not Found', 400));
  }
  const kitchen = await Kitchen.findById(req.params.id);
  if (!kitchen) {
    return next(new ErrorHandler('Kitchen Not Found', 200));
  }
  res.status(200).json({
    success: true,
    data: kitchen,
  });
});

// review a kitchen
exports.createKitchenReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, kitchenId, name, email } = req.body;
  if (!rating || !comment || !kitchenId || !name || !email) {
    return next(new ErrorHandler('Request invalid', 400));
  }
  // creating a review
  const review = {
    name,
    email,
    rating: Number(rating),
    comment,
  };
  const kitchen = await Kitchen.findById(kitchenId);
  // check if the user already reviewed
  const isReviewed = kitchen.reviews.some((rev) => rev.email === email);
  // user already review: update the review
  // user gives new review: add new review and update the number of reviews
  if (isReviewed) {
    kitchen.reviews.forEach((rev) => {
      if (rev.email === email) {
        rev.name = name;
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    kitchen.reviews.push(review);
    kitchen.numberOfReviews = kitchen.reviews.length;
  }
  // update kitchen rating
  let avg = 0;
  kitchen.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  avg = avg / kitchen.reviews.length;
  kitchen.rating = avg;
  // save the kitchen
  await kitchen.save({ validateBeforeSave: false });
  // send success response
  res.status(200).json({
    success: true,
    message: 'Kitchen review created',
  });
});

// send all kitchen reviews
exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Kitchen not found', 400));
  }
  const kitchen = await Kitchen.findById(req.params.id);
  if (!kitchen) {
    return next(new ErrorHandler('Kitchen not found', 200));
  }
  const reviews = kitchen.reviews;
  res.status(200).json({
    success: true,
    data: reviews,
  });
});

// delete kitchen review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Kitchen not found', 400));
  }
  const { reviewId } = req.body;
  if (!reviewId) {
    return next(new ErrorHandler('Review not found', 400));
  }
  const kitchen = await Kitchen.findById(req.params.id);
  if (!kitchen) {
    return next(new ErrorHandler('Kitchen not found', 200));
  }
  const reviews = kitchen.reviews.filter(
    (rev) => rev._id.toString() !== reviewId.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  avg = avg / reviews.length;
  const rating = avg || 0;
  const numberOfReviews = reviews.length;
  await Kitchen.findByIdAndUpdate(
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
