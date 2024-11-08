const mongoose = require('mongoose');

const truckAssignSchema = mongoose.Schema({
  TruckID: {
    type: String,
    required: [true, 'Please enter Truck ID'],
  },
  schoolName: {
    type: String,
    default: "",
    required: [true, 'Please enter School Name'],
  },
  containerID: {
    type: Array,
    default: [],
    required: [true, 'Please enter Containers'],
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

module.exports = mongoose.model('TruckAssign', truckAssignSchema);