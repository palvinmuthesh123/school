const router = require('express').Router();

const schoolController = require('../controllers/schoolController');

// send all school details
router.route('/').get(schoolController.getAllSchools);

// send a single school
router.route('/:id').get(schoolController.getSingleSchool);

// create school review
router.route('/reviews').post(schoolController.createSchoolReview);

// send all school reviews
router.route('/reviews/:id').get(schoolController.getAllReviews);

module.exports = router;