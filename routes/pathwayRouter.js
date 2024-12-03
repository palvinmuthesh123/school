const router = require('express').Router();

const pathwayController = require('../controllers/pathwayController');

// send all pathway details
router.route('/').get(pathwayController.getAllPathways);

// send a single pathway
router.route('/:id').get(pathwayController.getSinglePathway);

// create pathway review
router.route('/reviews').post(pathwayController.createPathwayReview);

// send all pathway reviews
router.route('/reviews/:id').get(pathwayController.getAllReviews);

// send all pathway reviews
router.route('/:id').put(pathwayController.updatePathway);

router.route('/:id').delete(pathwayController.deletePathway);

module.exports = router;
