import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../components/App.css';
import api from "../context/api" // Make sure this path points to where you saved api.js!

const Home = () => {
  const [posts, setPosts] = useState([]);
  
  // Pagination & Loading States
  const [nextPageUrl, setNextPageUrl] = useState(null); 
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false); 
  
  // Authentication States
  const { isAuthenticated, user } = useAuth();
  const currentUser = localStorage.getItem('username') || user;

  useEffect(() => {
    fetchInitialPosts();
  }, []);

  const fetchInitialPosts = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/posts/');
      setPosts(res.data.results || res.data); 
      setNextPageUrl(res.data.next); 
    } catch (err) {
      console.error("Error fetching posts");
    } finally {
      setIsLoadingInitial(false);
    }
  };

  const loadMorePosts = async () => {
    if (!nextPageUrl) return; 
    setIsLoadingMore(true); 
    
    try {
      const res = await axios.get(nextPageUrl); 
      setPosts(prevPosts => [...prevPosts, ...res.data.results]);
      setNextPageUrl(res.data.next);
    } catch (err) {
      console.error("Error fetching more posts");
    } finally {
      setIsLoadingMore(false); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`posts/${id}/`); 
        setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      } catch (err) {
        if (err.response && err.response.status === 403) {
            alert("Permission denied: You can only delete your own posts.");
        } else {
            alert("Error deleting post. Please try again.");
        }
      }
    }
  };

  if (isLoadingInitial) return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem' }}>Loading blogs...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>Latest Tech Blogs</h1>
      
      {posts.map(post => (
        <div key={post.id} className="card">
          <h2>{post.title}</h2>
          <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginBottom: '15px' }}>
            Written by <strong>{post.author_username}</strong> on {new Date(post.created_at).toLocaleDateString()}
          </p>
          <p>{post.content}</p>
          
          {/* THE AUTHORITY CHECK: Only the author sees the Edit and Delete buttons */}
          {/* THE FIXED LINE */}
          {currentUser && currentUser === post.author_username && (
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <Link to={`/edit/${post.id}`} className="btn btn-secondary" style={{ marginRight: '10px' }}>
                Edit Post
              </Link>
              <button onClick={() => handleDelete(post.id)} className="btn btn-danger">
                Delete
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Pagination Loader */}
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        {isLoadingMore && (
          <p style={{ fontWeight: 'bold', color: '#3498db', fontSize: '1.1rem' }}>
            ⏳ Fetching more posts...
          </p>
        )}
        
        {!isLoadingMore && nextPageUrl && (
          <button onClick={loadMorePosts} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '1.1rem' }}>
            Load More Blogs
          </button>
        )}
        
        {!nextPageUrl && posts.length > 0 && (
          <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
            You've reached the end of the blogs!
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;