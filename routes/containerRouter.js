const router = require('express').Router();

const containerController = require('../controllers/containerController');

// send all container details
router.route('/').get(containerController.getAllContainers);

// send a single container
router.route('/:id').get(containerController.getSingleContainer);

// create container review
router.route('/reviews').post(containerController.createContainerReview);

// send all container reviews
router.route('/reviews/:id').get(containerController.getAllReviews);

module.exports = router;
