const Container = require('../models/containerModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middleware/CatchAsyncErrors');
const cloudinary = require('../config/cloudinary');

// create a new container
exports.createContainer = catchAsyncError(async (req, res, next) => {
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
  const container = await Container.create(req.body);
  res.status(200).json({
    success: true,
    data: container,
  });
});

// update an existing container
exports.updateContainer = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Container Not Found', 400));
  }
  let container = await Container.findById(req.params.id);
  if (!container) {
    return next(new ErrorHandler('Container Not Found', 200));
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
  container = await Container.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    container,
  });
});

// delete an existing container
exports.deleteContainer = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Container Not Found', 400));
  }
  const container = await Container.findById(req.params.id);
  if (!container) {
    return next(new ErrorHandler('Container Not Found', 200));
  }
  for (let i = 0; i < container.images.length; i++) {
    await cloudinary.uploader.destroy(container.images[i].public_id);
  }
  await container.remove();
  res.status(200).json({
    success: true,
    message: 'Container deleted',
  });
});

// send all container details
exports.getAllContainers = catchAsyncError(async (req, res) => {
  const containers = await Container.find();
  const data = containers.map((item, index) => {
    const {
      _id: id,
      containerId,
      images,
      description,
    } = item;
    const newItem = {
      id,
      containerId,
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

// send only a single container detaisl
exports.getSingleContainer = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Container Not Found', 400));
  }
  const container = await Container.findById(req.params.id);
  if (!container) {
    return next(new ErrorHandler('Container Not Found', 200));
  }
  res.status(200).json({
    success: true,
    data: container,
  });
});

// review a container
exports.createContainerReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, containerId, name, email } = req.body;
  if (!rating || !comment || !containerId || !name || !email) {
    return next(new ErrorHandler('Request invalid', 400));
  }
  // creating a review
  const review = {
    name,
    email,
    rating: Number(rating),
    comment,
  };
  const container = await Container.findById(containerId);
  // check if the user already reviewed
  const isReviewed = container.reviews.some((rev) => rev.email === email);
  // user already review: update the review
  // user gives new review: add new review and update the number of reviews
  if (isReviewed) {
    container.reviews.forEach((rev) => {
      if (rev.email === email) {
        rev.name = name;
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    container.reviews.push(review);
    container.numberOfReviews = container.reviews.length;
  }
  // update container rating
  let avg = 0;
  container.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  avg = avg / container.reviews.length;
  container.rating = avg;
  // save the container
  await container.save({ validateBeforeSave: false });
  // send success response
  res.status(200).json({
    success: true,
    message: 'Container review created',
  });
});

// send all container reviews
exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Container not found', 400));
  }
  const container = await Container.findById(req.params.id);
  if (!container) {
    return next(new ErrorHandler('Container not found', 200));
  }
  const reviews = container.reviews;
  res.status(200).json({
    success: true,
    data: reviews,
  });
});

// delete container review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Container not found', 400));
  }
  const { reviewId } = req.body;
  if (!reviewId) {
    return next(new ErrorHandler('Review not found', 400));
  }
  const container = await Container.findById(req.params.id);
  if (!container) {
    return next(new ErrorHandler('Container not found', 200));
  }
  const reviews = container.reviews.filter(
    (rev) => rev._id.toString() !== reviewId.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  avg = avg / reviews.length;
  const rating = avg || 0;
  const numberOfReviews = reviews.length;
  await Container.findByIdAndUpdate(
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
