const mongoose = require('mongoose');

const truckSchema = mongoose.Schema({
  truckId: {
    type: String,
    required: [true, 'Please enter Truck ID'],
  },
  description: {
    type: String,
    default: ""
  },
  driver_name: {
    type: String,
    default: ""
  },
  driver_number: {
    type: String,
    default: ""
  },
  driver_email: {
    type: String,
    default: ""
  },
  route: {
    type: String,
    default: ""
  },
  kitchenId: {
    type: String,
    required: [true, 'Please enter kitchen ID'],
    default: ""
  },
  images: [
    {
      public_id: {
        type: String,
        default: ""
      },
      url: {
        type: String,
        default: ""
      },
    },
  ],
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

module.exports = mongoose.model('Truck', truckSchema);
