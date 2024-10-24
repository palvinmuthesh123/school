const router = require('express').Router();

const kitchenController = require('../controllers/kitchenController');

// send all kitchen detaisl
router.route('/').get(kitchenController.getAllKitchens);

// send a single kitchen
router.route('/:id').get(kitchenController.getSingleKitchen);

// create kitchen review
router.route('/reviews').post(kitchenController.createKitchenReview);

// send all kitchen reviews
router.route('/reviews/:id').get(kitchenController.getAllReviews);

module.exports = router;
