const mongoose = require('mongoose');

const cookerAssignSchema = mongoose.Schema({
  cookerID: {
    type: String,
    required: [true, 'Please enter Cooker ID'],
  },
  foodType: {
    type: String,
    default: "",
    required: [true, 'Please enter Food Type'],
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

module.exports = mongoose.model('CookerAssign', cookerAssignSchema);
