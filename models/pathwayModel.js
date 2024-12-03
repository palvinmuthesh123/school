const mongoose = require('mongoose');

const pathwaySchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter Route Name'],
  },
  description: {
    type: String,
    default: ""
    // required: [true, 'Please enter product description'],
  },
  schools: {
    type: Array,
    default: [],
    required: [true, 'Please select schools']
  },
  kitchenId: {
    type: Array,
    default: [],
    required: [true, 'Please select Kitchen']
  },
  images: [
    {
      public_id: {
        type: String,
        default: ""
        // required: true,
      },
      url: {
        type: String,
        default: ""
        // required: true,
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

module.exports = mongoose.model('Pathway', pathwaySchema);
