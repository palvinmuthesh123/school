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
  driverId: {
    type: String,
    default: "",
    required: [true, 'Please enter Driver Name'],
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
    expires: 43200,
  },
});

module.exports = mongoose.model('TruckAssign', truckAssignSchema);
