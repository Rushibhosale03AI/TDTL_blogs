import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../context/api'; // <--- Using our custom engine!
import '../components/App.css'; // <--- Importing the CSS for styling

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  // If the URL has an ID (e.g., /edit/5), React Router grabs it here
  const { id } = useParams(); 
  const isEditing = Boolean(id);

  // 1. If we are editing, fetch the existing post data to pre-fill the form
  useEffect(() => {
    if (isEditing) {
      const fetchPost = async () => {
        try {
          const res = await api.get(`posts/${id}/`);
          setTitle(res.data.title);
          // If the content is just text, pre-fill it. If it's a file link, leave it blank.
          if (!res.data.content.startsWith('File attached:')) {
              setContent(res.data.content);
          }
        } catch (err) {
          alert("Could not load post data.");
          navigate('/');
        }
      };
      fetchPost();
    }
  }, [id, isEditing, navigate]);

  // 2. Handle the Submission (Create OR Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // We MUST use FormData to support file uploads
    const formData = new FormData();
    formData.append('title', title);
    
    if (file) {
      formData.append('content', file);
    } else {
      formData.append('content', content);
    }

    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (isEditing) {
        // UPDATE: Send a PUT request to the specific post ID
        await api.put(`posts/${id}/`, formData, config);
        alert("Post updated successfully!");
      } else {
        // CREATE: Send a POST request to the main list URL
        await api.post('posts/', formData, config);
        alert("Post created successfully!");
      }
      
      navigate('/'); // Go back to home after success
      
    } catch (err) {
      if (err.response && err.response.status === 403) {
          alert("Permission denied: You can only edit your own posts.");
      } else {
          alert("Something went wrong. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <h2 style={{ marginBottom: '20px' }}>
            {isEditing ? 'Edit Your Post' : 'Create New Post'}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Content Text</label>
            <textarea 
              rows="6" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
            />
          </div>
          
          <div className="form-group" style={{ padding: '15px', backgroundColor: '#f9f9f9', border: '1px dashed #ccc' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
                {isEditing ? 'Replace File (Optional)' : 'OR Upload a File'}
            </label>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])} 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish Post')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostForm;