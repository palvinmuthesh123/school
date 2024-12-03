const router = require('express').Router();

const orderController = require('../controllers/orderController');

// create new order
router.route('/new').post(orderController.createNewOrder);

// send user orders
router.route('/').post(orderController.getUserOrders);

// send single order
router.route('/:id').get(orderController.getSingleOrder);

// get single order
router.route('/driver/:id').get(orderController.getDriverOrder);

// update single order status
router.route('/:id').put(orderController.updateOrderStatus);

// spoiled food alert
router.route('/spoiled/:id').get(orderController.spoiledAlert);

module.exports = router;
