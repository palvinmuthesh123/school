const mongoose = require('mongoose');

const containerAssignSchema = mongoose.Schema({
  // containerID: {
  //   type: String,
  //   required: [true, 'Please enter Container ID'],
  // },
  containerID: {
    type: Array,
    default: [],
    required: [true, 'Please enter Containers'],
  },
  cookerID: {
    type: String,
    default: '',
    required: [true, 'Please enter Cooker ID'],
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

module.exports = mongoose.model('ContainerAssign', containerAssignSchema);