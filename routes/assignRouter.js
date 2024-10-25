const router = require('express').Router();

const assignController = require('../controllers/assignController');

// Assign Cooker
router.route('/assignCooker').post(assignController.createCookerAssign);

// Assign Container
router.route('/assignContainer').post(assignController.createContainerAssign);

// Assign Truck
router.route('/assignTruck').post(assignController.createTruckAssign);

module.exports = router;
