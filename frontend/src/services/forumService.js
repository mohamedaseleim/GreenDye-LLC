import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/forums`;

export const getForumPosts = async () => {
  const res = await axios.get(API_BASE);
  return res.data;
};

export const getForumPost = async (id) => {
  const res = await axios.get(API_BASE + '/' + id);
  return res.data;
};

export const createForumPost = async (postData) => {
  const res = await axios.post(API_BASE, postData);
  return res.data;
};

export const addReply = async (postId, replyData) => {
  const res = await axios.post(API_BASE + '/' + postId + '/replies', replyData);
  return res.data;
};

export const likePost = async (postId) => {
  const res = await axios.post(API_BASE + '/' + postId + '/like');
  return res.data;
};

export const markResolved = async (postId) => {
  const res = await axios.post(API_BASE + '/' + postId + '/resolve');
  return res.data;
};
