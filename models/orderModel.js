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
  driver: {
    type: Object,
    default: {}
  },
  container: {
    type: Array,
    default: []
  },
  status: {
    type: String,
    default: 'PENDING'
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Order', orderSchema);
