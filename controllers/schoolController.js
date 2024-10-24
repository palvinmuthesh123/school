const School = require('../models/schoolModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middleware/CatchAsyncErrors');
const cloudinary = require('../config/cloudinary');

// create a new school
exports.createSchool = catchAsyncError(async (req, res, next) => {
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
  const school = await School.create(req.body);
  res.status(200).json({
    success: true,
    data: school,
  });
});

// update an existing school
exports.updateSchool = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('School Not Found', 400));
  }
  let school = await School.findById(req.params.id);
  if (!school) {
    return next(new ErrorHandler('School Not Found', 200));
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
  school = await School.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    school,
  });
});

// delete an existing school
exports.deleteSchool = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('School Not Found', 400));
  }
  const school = await School.findById(req.params.id);
  if (!school) {
    return next(new ErrorHandler('School Not Found', 200));
  }
  for (let i = 0; i < school.images.length; i++) {
    await cloudinary.uploader.destroy(school.images[i].public_id);
  }
  await school.remove();
  res.status(200).json({
    success: true,
    message: 'School deleted',
  });
});

// send all school details
exports.getAllSchools = catchAsyncError(async (req, res) => {
  const schools = await School.find();
  const data = schools.map((item, index) => {
    const {
      _id: id,
      schoolId,
      images,
      description,
    } = item;
    const newItem = {
      id,
      schoolId,
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

// send only a single school detaisl
exports.getSingleSchool = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('School Not Found', 400));
  }
  const school = await School.findById(req.params.id);
  if (!school) {
    return next(new ErrorHandler('School Not Found', 200));
  }
  res.status(200).json({
    success: true,
    data: school,
  });
});

// review a school
exports.createSchoolReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, schoolId, name, email } = req.body;
  if (!rating || !comment || !schoolId || !name || !email) {
    return next(new ErrorHandler('Request invalid', 400));
  }
  // creating a review
  const review = {
    name,
    email,
    rating: Number(rating),
    comment,
  };
  const school = await School.findById(schoolId);
  // check if the user already reviewed
  const isReviewed = school.reviews.some((rev) => rev.email === email);
  // user already review: update the review
  // user gives new review: add new review and update the number of reviews
  if (isReviewed) {
    school.reviews.forEach((rev) => {
      if (rev.email === email) {
        rev.name = name;
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    school.reviews.push(review);
    school.numberOfReviews = school.reviews.length;
  }
  // update school rating
  let avg = 0;
  school.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  avg = avg / school.reviews.length;
  school.rating = avg;
  // save the school
  await school.save({ validateBeforeSave: false });
  // send success response
  res.status(200).json({
    success: true,
    message: 'School review created',
  });
});

// send all school reviews
exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('School not found', 400));
  }
  const school = await School.findById(req.params.id);
  if (!school) {
    return next(new ErrorHandler('School not found', 200));
  }
  const reviews = school.reviews;
  res.status(200).json({
    success: true,
    data: reviews,
  });
});

// delete school review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('School not found', 400));
  }
  const { reviewId } = req.body;
  if (!reviewId) {
    return next(new ErrorHandler('Review not found', 400));
  }
  const school = await School.findById(req.params.id);
  if (!school) {
    return next(new ErrorHandler('School not found', 200));
  }
  const reviews = school.reviews.filter(
    (rev) => rev._id.toString() !== reviewId.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });
  avg = avg / reviews.length;
  const rating = avg || 0;
  const numberOfReviews = reviews.length;
  await School.findByIdAndUpdate(
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
