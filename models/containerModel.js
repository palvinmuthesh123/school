const mongoose = require('mongoose');

const containerSchema = mongoose.Schema({
  containerId: {
    type: String,
    required: [true, 'Please enter Container ID'],
  },
  description: {
    type: String,
    default: ""
    // required: [true, 'Please enter product description'],
  },
  kitchenId: {
    type: String,
    required: [true, 'Please enter kitchen ID'],
    default: ""
  },
  // rating: {
  //   type: Number,
  //   default: 0,
  // },
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
  // colors: [
  //   {
  //     type: String,
  //     required: true,
  //   },
  // ],
  // sizes: [{ type: String, required: true }],
  // company: {
  //   type: String,
  //   required: [true, 'Please enter product company'],
  // },
  // category: {
  //   type: String,
  //   required: [true, 'Please enter product category'],
  // },
  // stock: {
  //   type: Number,
  //   required: [true, 'Please enter product stock'],
  //   maxLength: [4, 'stock cannot exceed 4 characters'],
  //   min: 0,
  //   default: 1,
  // },
  // numberOfReviews: {
  //   type: Number,
  //   default: 0,
  // },
  // reviews: [
  //   {
  //     name: {
  //       type: String,
  //       required: true,
  //     },
  //     email: {
  //       type: String,
  //       required: true,
  //     },
  //     rating: {
  //       type: Number,
  //       required: true,
  //     },
  //     comment: {
  //       type: String,
  //       required: true,
  //     },
  //   },
  // ],
  // shipping: {
  //   type: Boolean,
  //   default: true,
  // },
  // featured: {
  //   type: Boolean,
  //   default: false,
  // },
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

module.exports = mongoose.model('Container', containerSchema);
