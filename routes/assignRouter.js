const router = require('express').Router();

const assignController = require('../controllers/assignController');

// Assign Cooker
router.route('/assignCooker').post(assignController.createCookerAssign);

// Assign Container
router.route('/assignContainer').post(assignController.createContainerAssign);

// Assign Truck
router.route('/assignTruck').post(assignController.createTruckAssign);

// Get Assign Cooker
router.route('/getassignCooker').get(assignController.getCookerAssign);

// Get Assign Container
router.route('/getassignContainer').get(assignController.getContainerAssign);

// Get Assign Truck
router.route('/getassignTruck').get(assignController.getTruckAssign);

// Delete Assign Container
router.route('/deleteassignCooker/:id').delete(assignController.deleteCookerAssign);

// Delete Assign Cooker
router.route('/deleteassignContainer/:id').delete(assignController.deleteContainerAssign);

// Delete Assign Truck
router.route('/deleteassignTruck/:id').delete(assignController.deleteTruckAssign);

module.exports = router;