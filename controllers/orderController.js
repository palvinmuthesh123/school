const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middleware/CatchAsyncErrors');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const adminModel = require('../models/adminModel');

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // To handle line breaks
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN,
  databaseURL: process.env.DATABASE_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://middaymealapp-810ed-default-rtdb.firebaseio.com"
});

// create new order
exports.createNewOrder = catchAsyncError(async (req, res, next) => {
  const {
    name,
    email,
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: { name, email },
  });
  res.status(200).json({
    success: true,
    data: order,
  });
});

// send single order
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Order not found', 400));
  }

  const orders = await Order.find({
    "cooker.cookerID": req.params.id
  });

  if (!orders || orders.length === 0) {
    return next(new ErrorHandler('Order not found', 404));
  }

  const filteredOrders = orders.map(order => {
    const filteredCooker = order.cooker.filter(c => c.cookerID === req.params.id);
    const filteredContainerIDs = filteredCooker.map(c => c.containerID);
    const uniqueContainerIDs = [...new Set(filteredContainerIDs.flat())];
    return {
      ...order.toObject(),
      cooker: filteredCooker, 
      container: uniqueContainerIDs,
    };
  });

  res.status(200).json({
    success: true,
    data: filteredOrders,
  });
});

// send driver order
exports.getDriverOrder = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Order not found', 400));
  }
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const order = await Order.find({
    "driver._id": mongoose.Types.ObjectId(req.params.id),
    "createdAt": { $gte: twelveHoursAgo }
  });
  if (!order) {
    return next(new ErrorHandler('Order not found', 200));
  }
  res.status(200).json({
    success: true,
    data: order,
  });
});

// send user orders
exports.getUserOrders = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ErrorHandler('Order not found', 400));
  }
  const order = await Order.find({ 'user.email': email });
  if (!order) {
    return next(new ErrorHandler('Order not found', 200));
  }
  res.status(200).json({
    success: true,
    data: order,
  });
});

// send all orders
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find();
  res.status(200).json({
    success: true,
    data: orders,
  });
});

// update order status
exports.updateOrderStatus = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Order not found', 400));
  }
  if (!req.body.status) {
    return next(new ErrorHandler('Invalid request', 400));
  }
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler('Order not found', 200));
  }
  if (order.status === 'DELIVERED') {
    return next(new ErrorHandler('You have already delivered this order', 400));
  } else if (order.status === 'SPOILED') {
    return next(new ErrorHandler('The Order is Spoiled', 400));
  }

  if(req.body.status== 'SPOILED') {
    const user = await adminModel.find({_id: order.driver._id})
    const orderDetails = getCookerDetails(order)
    var foods = ''
    orderDetails.map((group, i) => {
      foods = foods!='' ? foods + ', ' + group.cookerDetails.description : foods + group.cookerDetails.description
    })
    const title = "Food is Spoiled !!!"
    const body = `Container ${order.container.join(",")} of ${foods} Got Spoiled`
    const message = {
      notification: { title, body },
      token: user[0].fcm,
    };
    const response = await admin.messaging().send(message);
  }

  order.status = req.body.status;
  order.createdAt = Date.now();
  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    data: order,
  });

});

// delete order
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler('Order not found', 400));
  }
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler('Order not found', 200));
  }
  await order.remove();
  res.status(200).json({
    success: true,
    message: 'Order deleted',
  });
});

const updateStock = async (id, quantity) => {
  const product = await Product.findById(id);
  if (product.stock < quantity) {
    return false;
  }
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
  return true;
};

const getCookerDetails = (order) => {
  const cookerMap = new Map();
  order.cooker.forEach((cookerItem) => {
    const { cookerID, containerID, cookerDetails } = cookerItem;
    if (cookerMap.has(cookerID)) {
      cookerMap.get(cookerID).containers.add(containerID);
    } else {
      cookerMap.set(cookerID, {
        cookerDetails: cookerDetails,
        containers: new Set([containerID]),
      });
    }
  });
  return Array.from(cookerMap.entries()).map(([cookerID, { containers, cookerDetails }]) => ({
    cookerID,
    cookerDetails,
    containers: Array.from(containers).join(', '),
  }));
};