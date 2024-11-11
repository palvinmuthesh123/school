const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  school: {
    type: Object,
    default: {}
  },
  cooker: {
    type: Array,
    default: []
  },
  truck: {
    type: Object,
    default: {}
  },
  container: {
    type: Array,
    default: []
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Order', orderSchema);
