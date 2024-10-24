const router = require('express').Router();

const truckController = require('../controllers/truckController');

// send all truck details
router.route('/').get(truckController.getAllTrucks);

// send a single truck
router.route('/:id').get(truckController.getSingleTruck);

// create truck review
router.route('/reviews').post(truckController.createTruckReview);

// send all truck reviews
router.route('/reviews/:id').get(truckController.getAllReviews);

module.exports = router;
