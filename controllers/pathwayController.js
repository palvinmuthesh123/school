const Pathway = require('../models/pathwayModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middleware/CatchAsyncErrors');
const cloudinary = require('../config/cloudinary');

// create a new pathway
exports.createPathway = catchAsyncError(async (req, res, next) => {
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
  const pathway = await Pathway.create(req.body);
  res.status(200).json({
    success: true,
    data: pathway,
  });
});

// update an existing pathway
exports.updatePathway = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Pathway Not Found', 400));
  }
  let pathway = await Pathway.findById(req.params.id);
  if (!pathway) {
    return next(new ErrorHandler('Pathway Not Found', 200));
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
  pathway = await Pathway.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    pathway,
  });
});

// delete an existing pathway
exports.deletePathway = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Pathway Not Found', 400));
  }
  const pathway = await Pathway.findById(req.params.id);
  if (!pathway) {
    return next(new ErrorHandler('Pathway Not Found', 200));
  }
  for (let i = 0; i < pathway.images.length; i++) {
    await cloudinary.uploader.destroy(pathway.images[i].public_id);
  }
  await pathway.remove();
  res.status(200).json({
    success: true,
    message: 'Pathway deleted',
  });
});

// send all pathway details
exports.getAllPathways = catchAsyncError(async (req, res) => {
  const { kitchenId } = req.query;
  const query = kitchenId ? { kitchenId } : {};
  const pathways = await Pathway.find(query);
  const data = pathways.map((item, index) => {
    const {
      _id: id,
      name,
      images,
      schools,
      description,
      kitchenId
    } = item;
    const newItem = {
      id,
      name,
      image: images && images[0] && images[0].url ? images[0].url : "",
      schools,
      description,
      kitchenId
    };
    return newItem;
  });
  res.status(200).json({
    success: true,
    data,
  });
});

// send only a single pathway detaisl
exports.getSinglePathway = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Pathway Not Found', 400));
  }
  const pathway = await Pathway.findById(req.params.id);
  if (!pathway) {
    return next(new ErrorHandler('Pathway Not Found', 200));
  }
  res.status(200).json({
    success: true,
    data: pathway,
  });
});

// review a pathway
exports.createPathwayReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, pathwayId, name, email } = req.body;
  if (!rating || !comment || !pathwayId || !name || !email) {
    return next(new ErrorHandler('Request invalid', 400));
  }
  // creating a review
  const review = {
    name,
    email,
    rating: Number(rating),
    comment,
  };
  const pathway = await Pathway.findById(pathwayId);
  // check if the user already reviewed
  const isReviewed = pathway.reviews.some((rev) => rev.email === email);
  // user already review: update the review
  // user gives new review: add new review and update the number of reviews
  if (isReviewed) {
    pathway.reviews.forEach((rev) => {
      if (rev.email === email) {
        rev.name = name;
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    pathway.reviews.push(review);
    pathway.numberOfReviews = pathway.reviews.length;
  }
  // update pathway rating
  let avg = 0;
  pathway.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  avg = avg / pathway.reviews.length;
  pathway.rating = avg;
  // save the pathway
  await pathway.save({ validateBeforeSave: false });
  // send success response
  res.status(200).json({
    success: true,
    message: 'Pathway review created',
  });
});

// send all pathway reviews
exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Pathway not found', 400));
  }
  const pathway = await Pathway.findById(req.params.id);
  if (!pathway) {
    return next(new ErrorHandler('Pathway not found', 200));
  }
  const reviews = pathway.reviews;
  res.status(200).json({
    success: true,
    data: reviews,
  });
});

// delete pathway review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Pathway not found', 400));
  }
  const { reviewId } = req.body;
  if (!reviewId) {
    return next(new ErrorHandler('Review not found', 400));
  }
  const pathway = await Pathway.findById(req.params.id);
  if (!pathway) {
    return next(new ErrorHandler('Pathway not found', 200));
  }
  const reviews = pathway.reviews.filter(
    (rev) => rev._id.toString() !== reviewId.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  avg = avg / reviews.length;
  const rating = avg || 0;
  const numberOfReviews = reviews.length;
  await Pathway.findByIdAndUpdate(
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
