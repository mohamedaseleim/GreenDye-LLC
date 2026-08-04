const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getForumPosts,
  getForumPost,
  createForumPost,
  updateForumPost,
  deleteForumPost,
  addReply,
  likePost,
  markAsResolved
} = require('../controllers/forumController');

// Forum routes
router.get('/', getForumPosts);
router.get('/:id', getForumPost);
router.post('/', protect, createForumPost);
router.put('/:id', protect, updateForumPost);
router.delete('/:id', protect, deleteForumPost);
router.post('/:id/replies', protect, addReply);
router.post('/:id/like', protect, likePost);
router.post('/:id/resolve', protect, markAsResolved);

module.exports = router;
