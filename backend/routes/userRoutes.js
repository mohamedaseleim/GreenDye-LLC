const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  suspendUser,
  activateUser,
  getUserActivity,
  resetUserPassword,
  bulkUpdateUsers,
  bulkDeleteUsers
} = require('../controllers/userController');

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/bulk-update')
  .post(bulkUpdateUsers);

router.route('/bulk-delete')
  .post(bulkDeleteUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/:id/suspend')
  .put(suspendUser);

router.route('/:id/activate')
  .put(activateUser);

router.route('/:id/activity')
  .get(getUserActivity);

router.route('/:id/reset-password')
  .post(resetUserPassword);

module.exports = router;
