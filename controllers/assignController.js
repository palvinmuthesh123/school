const ContainerAssign = require('../models/containerAssignModel');
const CookerAssign = require('../models/cookerAssignModel');
const TruckAssign = require('../models/truckAssignModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middleware/CatchAsyncErrors');
const cloudinary = require('../config/cloudinary');

exports.createCookerAssign = catchAsyncError(async (req, res, next) => {
  console.log(req, "RRRRRRRRRRRR")
  // req.body.admin = req.user.id;
  const truck = await CookerAssign.create(req.body);
  res.status(200).json({
    success: true,
    data: truck,
  });
});

exports.createContainerAssign = catchAsyncError(async (req, res, next) => {
  // req.body.admin = req.user.id;
  const truck = await ContainerAssign.create(req.body);
  res.status(200).json({
    success: true,
    data: truck,
  });
});

exports.createTruckAssign = catchAsyncError(async (req, res, next) => {
  // req.body.admin = req.user.id;
  const truck = await TruckAssign.create(req.body);
  res.status(200).json({
    success: true,
    data: truck,
  });
});

exports.getCookerAssign = catchAsyncError(async (req, res, next) => {
  console.log(req, "RRRRRRRRRRRR")
  const truck = await CookerAssign.find({});
  res.status(200).json({
    success: true,
    data: truck,
  });
});

exports.getContainerAssign = catchAsyncError(async (req, res, next) => {
  console.log(req, "RRRRRRRRRRRR")
  const truck = await ContainerAssign.find({});
  res.status(200).json({
    success: true,
    data: truck,
  });
});

exports.getTruckAssign = catchAsyncError(async (req, res, next) => {
  console.log(req, "RRRRRRRRRRRR")
  const truck = await TruckAssign.find({});
  res.status(200).json({
    success: true,
    data: truck,
  });
});
