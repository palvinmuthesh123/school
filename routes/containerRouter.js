const router = require('express').Router();

const containerController = require('../controllers/containerController');

// send all container details
router.route('/').get(containerController.getAllContainers);

// send a single container
router.route('/:id').get(containerController.getSingleContainer);

// create container
router.route('/new').post(containerController.createContainer);

// send all container reviews
router.route('/reviews/:id').get(containerController.getAllReviews);

router.route('/:id').put(containerController.updateContainer);

router.route('/:id').delete(containerController.deleteContainer);

module.exports = router;
