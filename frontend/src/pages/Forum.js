import React, { useState, useEffect } from "react";
import {
  getForumPosts,
  getForumPost,
  createForumPost,
  addReply,
  likePost,
  markResolved
} from "../services/forumService";

function Forum() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newReply, setNewReply] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getForumPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleSelectPost = async (id) => {
    try {
      const post = await getForumPost(id);
      setSelectedPost(post);
    } catch (error) {
      console.error("Error loading post:", error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await createForumPost({
        title: newPostTitle,
        content: newPostContent
      });
      setNewPostTitle("");
      setNewPostContent("");
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!selectedPost) return;
    try {
      await addReply(selectedPost._id, {
        content: newReply
      });
      setNewReply("");
      const updated = await getForumPost(selectedPost._id);
      setSelectedPost(updated);
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const handleLike = async (id) => {
    try {
      await likePost(id);
      if (selectedPost && selectedPost._id === id) {
        const updated = await getForumPost(id);
        setSelectedPost(updated);
      } else {
        fetchPosts();
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleResolve = async (id) => {
    try {
      await markResolved(id);
      const updated = await getForumPost(id);
      setSelectedPost(updated);
    } catch (error) {
      console.error("Error resolving post:", error);
    }
  };

  return (
    <div className="forum-container" style={{ padding: "1rem" }}>
      <h1>Discussion Forum</h1>
      <div style={{ marginBottom: "2rem" }}>
        <h2>Create New Post</h2>
        <form onSubmit={handleCreatePost}>
          <div>
            <input
              type="text"
              placeholder="Title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Content"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit">Post</button>
        </form>
      </div>
      {!selectedPost && (
        <div>
          <h2>All Posts</h2>
          {posts.map((post) => (
            <div
              key={post._id}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                marginBottom: "1rem"
              }}
            >
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <p>
                Likes: {post.likes} {" "}
                <button onClick={() => handleLike(post._id)}>Like</button>
              </p>
              <button onClick={() => handleSelectPost(post._id)}>
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
      {selectedPost && (
        <div>
          <button onClick={() => setSelectedPost(null)}>
            Back to all posts
          </button>
          <h2>{selectedPost.title}</h2>
          <p>{selectedPost.content}</p>
          <p>Likes: {selectedPost.likes}</p>
          {!selectedPost.resolved && (
            <button onClick={() => handleResolve(selectedPost._id)}>
              Mark as Resolved
            </button>
          )}
          <div style={{ marginTop: "1rem" }}>
            <h3>Replies</h3>
            {selectedPost.replies && selectedPost.replies.length > 0 ? (
              selectedPost.replies.map((reply, index) => (
                <div
                  key={index}
                  style={{ borderTop: "1px solid #eee", padding: "0.5rem 0" }}
                >
                  <p>{reply.content}</p>
                </div>
              ))
            ) : (
              <p>No replies yet.</p>
            )}
          </div>
          <div style={{ marginTop: "1rem" }}>
            <h3>Add a Reply</h3>
            <form onSubmit={handleAddReply}>
              <textarea
                placeholder="Your reply"
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                required
              ></textarea>
              <button type="submit">Reply</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Forum;
