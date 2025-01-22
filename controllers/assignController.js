const ContainerAssign = require('../models/containerAssignModel');
const CookerAssign = require('../models/cookerAssignModel');
const TruckAssign = require('../models/truckAssignModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middleware/CatchAsyncErrors');
const cloudinary = require('../config/cloudinary');
const containerAssignModel = require('../models/containerAssignModel');
const schoolModel = require('../models/schoolModel');
const truckModel = require('../models/truckModel');
const orderModel = require('../models/orderModel');
const productModel = require('../models/productModel');
const pathwayModel = require('../models/pathwayModel');
const adminModel = require('../models/adminModel');
const mongoose = require('mongoose');

exports.createCookerAssign = catchAsyncError(async (req, res, next) => {
  const cooker = await CookerAssign.find({cookerID: req.body.cookerID})
  if(cooker.length==0) {
    const truck = await CookerAssign.create(req.body);
    res.status(200).json({
      success: true,
      data: truck,
    });
  }
  else {
    res.status(400).json({
      success: false,
      message: "Cooker Already Assigned !!!",
    });
  }
});

exports.createContainerAssign = catchAsyncError(async (req, res, next) => {
  // req.body.admin = req.user.id;
  // const cont = await ContainerAssign.find({containerID: req.body.containerID})
  const cont = await ContainerAssign.find({containerID: { $in: req.body.containerID }})
  if(cont.length==0) {
    const container = await ContainerAssign.create(req.body);
    res.status(200).json({
      success: true,
      data: container,
    });
  }
  else {
    res.status(400).json({
      success: false,
      data: "Container Already Assigned !!!",
    });
  }
});

exports.createTruckAssign = catchAsyncError(async (req, res, next) => {

  const tru = await TruckAssign.find({TruckID: req.body.TruckID});
  const truCont = await TruckAssign.find({
    containerID: { $in: req.body.containerID },
  });
  if(tru.length == 0 && truCont.length == 0) {
    const truck = await TruckAssign.create(req.body);
    const truckData = await truckModel.find({truckId: req.body.TruckID})
    const schoolData = await pathwayModel.find({name: req.body.schoolName})
    const cookerDatas = await containerAssignModel.find({ containerID: { $in: req.body.containerID } })

    const cookerDatasWithDetails = await Promise.all(
      cookerDatas.map(async (cooker) => {
        const cookid = cooker.cookerID
        const cookerDetails = await productModel.find({ cookerId: cookid });
        return {
          ...cooker.toObject(),
          cookerDetails: cookerDetails && cookerDetails.length>0 ? cookerDetails[0] : {},
        };
      })
    );
    
    const datas = {
      school: schoolData[0],
      cooker: cookerDatasWithDetails,
      truck: truckData[0],
      container: req.body.containerID,
      driver: {}
    }
    
    const order = await orderModel.create(datas);
    
    res.status(200).json({
      success: true,
      data: truck,
    });
  }
  else if(tru.length == 0) {
    res.status(400).json({
      success: false,
      data: "Truck is Already Assigned with the Containers !!!",
    });
  } 
  else if(truCont.length == 0) {
    res.status(400).json({
      success: false,
      data: "Provided Containers is Already Assigned !!!",
    });
  }
  
});

exports.getCookerAssign = catchAsyncError(async (req, res, next) => {
  const truck = await CookerAssign.find({});
  res.status(200).json({
    success: true,
    data: truck,
  });
});

exports.getContainerAssign = catchAsyncError(async (req, res, next) => {
  const truck = await ContainerAssign.find({});
  res.status(200).json({
    success: true,
    data: truck,
  });
});

exports.getTruckAssign = catchAsyncError(async (req, res, next) => {
  const truck = await TruckAssign.find({});
  res.status(200).json({
    success: true,
    data: truck,
  });
});

exports.deleteCookerAssign = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Cooker Assign Data Not Found', 400));
  }
  const cookerassigns = await CookerAssign.findById(req.params.id);
  console.log(cookerassigns, "CCCCCCCCCCCCCCCC")
  if (!cookerassigns) {
    return next(new ErrorHandler('Cooker Assign Data Not Found', 200));
  }
  if(cookerassigns && cookerassigns.images && cookerassigns.images.length>0) {
    for (let i = 0; i < cookerassigns.images.length; i++) {
      await cloudinary.uploader.destroy(cookerassigns.images[i].public_id);
    }
  }
  await cookerassigns.remove();
  res.status(200).json({
    success: true,
    message: 'Cooker Assigned Data deleted',
  });
});

exports.deleteContainerAssign = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Container Assign Data Not Found', 400));
  }
  const containerassigns = await ContainerAssign.findById(req.params.id);
  if (!containerassigns) {
    return next(new ErrorHandler('Container Assign Data Not Found', 200));
  }
  if(containerassigns && containerassigns.images && containerassigns.images.length>0) {
    for (let i = 0; i < containerassigns.images.length; i++) {
      await cloudinary.uploader.destroy(containerassigns.images[i].public_id);
    }
  }
  await containerassigns.remove();
  res.status(200).json({
    success: true,
    message: 'Container Assigned Data deleted',
  });
});

exports.deleteTruckAssign = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Truck Assign Data Not Found', 400));
  }
  const truckassigns = await TruckAssign.findById(req.params.id);
  if (!truckassigns) {
    return next(new ErrorHandler('Truck Assign Data Not Found', 200));
  }
  if(truckassigns && truckassigns.images && truckassigns.images.length>0) {
    for (let i = 0; i < truckassigns.images.length; i++) {
      await cloudinary.uploader.destroy(truckassigns.images[i].public_id);
    }
  }
  await truckassigns.remove();
  res.status(200).json({
    success: true,
    message: 'Truck Assigned Data deleted',
  });
});