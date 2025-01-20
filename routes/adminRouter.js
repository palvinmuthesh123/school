const router = require('express').Router();

const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const containerController = require('../controllers/containerController');
const truckController = require('../controllers/truckController');
const kitchenController = require('../controllers/kitchenController');
const schoolController = require('../controllers/schoolController');
const pathwayController = require('../controllers/pathwayController');

const auth = require('../middleware/Auth');

router.route('/auth').post(adminController.sendCurrentUser);

// register new admin
router
  .route('/register')
  .post(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('super'),
    adminController.registerAdmin
  );

// login admin
router.route('/login').post(adminController.loginAdmin);

// logout admin
router.route('/logout').get(adminController.logoutAdmin);

// get all admin details
router
  .route('/users')
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('super'),
    adminController.getAllAdminDetails
  );

  router
  .route('/drivers')
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('super'),
    adminController.getDriverDetails
  );

// get single admin details
router
  .route('/users/:id')
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('super'),
    adminController.getSingleAdminDetails
  )
  .put(
    // auth.checkUserAuthentication,
    // auth.checkAdminPrivileges('super'),
    adminController.updateAdminPrivilege
  )
  .delete(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('super'),
    adminController.deleteAdmin
  );

// create a new product
router
  .route('/product/new')
  .post(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('moderate', 'super'),
    productController.createProduct
  );

  // create a new container
  router
  .route('/container/new')
  .post(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('moderate', 'super'),
    containerController.createContainer
  );

  // create a new truck
  router
  .route('/truck/new')
  .post(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('moderate', 'super'),
    truckController.createTruck
  );

  // create a new kitchen
  router
  .route('/kitchen/new')
  .post(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('moderate', 'super'),
    kitchenController.createKitchen
  );

  // create a new school
  router
  .route('/school/new')
  .post(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('moderate', 'super'),
    schoolController.createSchool
  );

  // create a new pathway
  router
  .route('/pathway/new')
  .post(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('moderate', 'super'),
    pathwayController.createPathway
  );

// send, update, delete a single product
router
  .route('/product/:id')
  .put(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('moderate', 'super'),
    productController.updateProduct
  )
  .delete(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('moderate', 'super'),
    productController.deleteProduct
  );

// delete product reviews
router
  .route('/product/review/:id')
  .delete(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('moderate', 'super'),
    productController.deleteReview
  );

// send all orders
router
  .route('/orders')
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('moderate', 'super', 'low'),
    orderController.getAllOrders
  );

// send single order
router
  .route('/order/:id')
  .put(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('moderate', 'super', 'low'),
    orderController.updateOrderStatus
  )
  .delete(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges('moderate', 'super'),
    orderController.deleteOrder
  );

module.exports = router;
