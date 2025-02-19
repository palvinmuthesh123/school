const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middleware/CatchAsyncErrors');
const { sendToken } = require('../utils/jwt');

exports.registerAdmin = catchAsyncError(async (req, res, next) => {
  const { name, email, password, privilege, cooker, container, truck, school, kitchen, fcm, mobile } = req.body;
  if (!name || !email || !password || !mobile) {
    return next(new ErrorHandler('Missing fields', 400));
  }
  const admin = await Admin.create({
    name,
    email,
    mobile,
    privilege,
    password,
    cooker,
    container,
    truck,
    school,
    kitchen,
    fcm
  });
  res.status(200).json({
    success: true,
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      privilege: admin.privilege,
      cooker: admin.cooker,
      container: admin.container,
      truck: admin.truck,
      school: admin.school,
      kitchen: admin.kitchen,
      mobile: admin.mobile,
      fcm: admin.fcm
    },
  });
});

exports.loginAdmin = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler('Missing fields', 400));
  }
  const admin = await Admin.findOne({ email }).select('+password');
  console.log(admin, "AAAAAAAAAAAAA")
  if (!admin) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }
  const isPasswordMatched = await admin.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }
  sendToken(admin, 200, res);
});

exports.logoutAdmin = catchAsyncError(async (req, res, next) => {
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });
  res.status(200).json({
    success: true,
    message: 'Logged Out',
  });
});

exports.getAllAdminDetails = catchAsyncError(async (req, res, next) => {
  const admin = await Admin.find();
  const adminData = admin.map((item) => {
    return {
      id: item._id,
      name: item.name,
      email: item.email,
      privilege: item.privilege,
      cooker: item.cooker,
      container: item.container,
      truck: item.truck,
      school: item.school,
      kitchen: item.kitchen,
      fcm: item.fcm
    };
  });
  res.status(200).json({
    success: true,
    data: adminData,
  });
});

exports.getDriverDetails = catchAsyncError(async (req, res, next) => {
  const admin = await Admin.find({school: true});
  const adminData = admin.map((item) => {
    return {
      id: item._id,
      name: item.name,
      email: item.email,
      privilege: item.privilege,
      cooker: item.cooker,
      container: item.container,
      truck: item.truck,
      school: item.school,
      kitchen: item.kitchen,
      fcm: item.fcm
    };
  });
  res.status(200).json({
    success: true,
    data: adminData,
  });
});

exports.getSingleAdminDetails = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('User not found', 400));
  }
  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    return next(new ErrorHandler('User not found', 200));
  }
  const adminData = {
    id: admin._id,
    name: admin.name,
    email: admin.email,
  };
  res.status(200).json({
    success: true,
    data: adminData,
  });
});

exports.sendCurrentUser = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler('User not found', 400));
  }
  const decodedData = await jwt.verify(token, process.env.JWT_SECRET);
  const admin = await Admin.findById(decodedData.id);
  if (!admin) {
    new ErrorHandler('User not found', 401);
  }
  sendToken(admin, 200, res);
});

// exports.updateAdminPrivilege = catchAsyncError(async (req, res, next) => {
//   // const { privilege } = req.body;
//   const { cooker, container, truck, school, kitchen, fcm } = req.body;
//   console.log();
//   if (!req.params.id) {
//     return next(new ErrorHandler('User not found', 400));
//   }
//   // if (!cooker || !container || !truck || !school || !kitchen || !fcm) {
//   //   return next(new ErrorHandler('Invalid: no data provided', 400));
//   // }
//   // if (!['super', 'moderate', 'low'].includes(privilege)) {
//   //   return next(new ErrorHandler('Invalid: data invalid', 400));
//   // }
//   var admin = await Admin.findById(req.params.id);
//   if (!admin) {
//     return next(new ErrorHandler('User not found', 200));
//   }
//   if (admin.email === req.user.email) {
//     return next(new ErrorHandler('Cannot change privilege for self', 400));
//   }
//   admin = Object.assign(admin, {
//     cooker: cooker,
//     container: container,
//     truck: truck,
//     school: school,
//     kitchen: kitchen,
//     fcm: fcm
//   });

//   await admin.save();
//   res.status(200).json({
//     success: true,
//     data: admin,
//   });
// });
exports.updateAdminPrivilege = catchAsyncError(async (req, res, next) => {
  const { cookers, containers, trucks, schools, kitchens, fcm } = req.body;
  
  // Log request body for debugging
  console.log("Request Body:", req.body);

  // Check if ID parameter is provided
  if (!req.params.id) {
    return next(new ErrorHandler('User not found', 400));
  }

  // Find admin by ID
  let admin = await Admin.findById(req.params.id);
  if (!admin) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Prevent updating own privileges
  // if (admin.email === req.user.email) {
  //   return next(new ErrorHandler('Cannot change privilege for self', 400));
  // }

  // Update fields directly
  admin.cooker = cookers !== undefined ? cookers : admin.cooker;
  admin.container = containers !== undefined ? containers : admin.container;
  admin.truck = trucks !== undefined ? trucks : admin.truck;
  admin.school = schools !== undefined ? schools : admin.school;
  admin.kitchen = kitchens !== undefined ? kitchens : admin.kitchen;
  admin.fcm = fcm !== undefined ? fcm : admin.fcm;

  console.log(admin, "AAAAAAAAAAAAAAAAAA")

  // Save updated admin
  await admin.save();

  res.status(200).json({
    success: true,
    data: admin,
  });
});

exports.deleteAdmin = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('User not found', 400));
  }
  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    return next(new ErrorHandler('User not found', 200));
  }
  if (admin.email === req.user.email) {
    return next(new ErrorHandler('Cannot delete self', 400));
  }
  await admin.remove();
  res.status(200).json({
    success: true,
    message: 'User deleted',
  });
});
