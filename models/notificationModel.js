const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  truckId: {
    type: String,
    default: ""
    // required: [true, 'Please enter Truck ID'],
  },
  description: {
    type: String,
    default: ""
    // required: [true, 'Please enter product description'],
  },
  admin: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
