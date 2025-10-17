import React, { useState, useEffect } from 'react';
import { Search, Send, ThumbsUp, MessageCircle, Share2, Flag, Clock } from 'lucide-react';
import './CommunityDiscussion.css';
import axios from 'axios';

// Get current user from localStorage
const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || {};
  return { token, ...user };
};

const CommunityDiscussion = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [discussions, setDiscussions] = useState([]);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'budgeting', name: 'Budgeting' },
    { id: 'savings', name: 'Savings' },
    { id: 'investment', name: 'Investments' },
    { id: 'debt', name: 'Debt Management' },
    { id: 'taxes', name: 'Taxes' },
    { id: 'retirement', name: 'Retirement' }
  ];

  // Set up Axios with auth header
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      Authorization: `Bearer ${currentUser.token}`
    }
  });

  // Fetch current user name
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser.token || !currentUser.userId) {
        setError('Please log in to view discussions.');
        setLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get(`/users/user/${currentUser.userId}`);
        setCurrentUser(prev => ({
          ...prev,
          name: response.data.name
        }));
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile.');
      }
    };

    fetchUserProfile();
  }, [currentUser.token, currentUser.userId]);

  // Fetch discussions from backend
  useEffect(() => {
    const fetchDiscussions = async () => {
      if (!currentUser.token) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get('/discussions', {
          params: {
            category: filterCategory,
            search: searchQuery,
            tab: activeTab,
            userId: activeTab === 'bookmarked' ? currentUser.userId : undefined
          }
        });
        setDiscussions(response.data.map(post => ({
          ...post,
          comments: post.comments.length,
          isBookmarked: post.isBookmarked.includes(currentUser.userId)
        })));
        setError(null);
      } catch (error) {
        console.error('Error fetching discussions:', error);
        setError('Failed to load discussions.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, [activeTab, filterCategory, searchQuery, currentUser.token, currentUser.userId]);

  // Handler for creating a new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await axiosInstance.post('/discussions', {
        category: filterCategory !== 'all' ? filterCategory : 'general',
        title: newPost.split(' ').slice(0, 7).join(' ') + (newPost.split(' ').length > 7 ? '...' : ''),
        content: newPost,
        tags: [filterCategory !== 'all' ? filterCategory : 'general']
      });

      setDiscussions([{
        ...response.data,
        comments: 0,
        isBookmarked: false
      }, ...discussions]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post.');
    }
  };

  // Handler for liking a post
  const handleLike = async (postId) => {
    try {
      const response = await axiosInstance.post(`/discussions/${postId}/like`);
      setDiscussions(discussions.map(post => 
        post._id === postId ? { ...post, likes: response.data.likes } : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Handler for bookmarking a post
  const handleBookmark = async (postId) => {
    try {
      const response = await axiosInstance.post(`/discussions/${postId}/bookmark`);
      setDiscussions(discussions.map(post => 
        post._id === postId ? { 
          ...post, 
          isBookmarked: response.data.isBookmarked.includes(currentUser.userId)
        } : post
      ));
    } catch (error) {
      console.error('Error bookmarking post:', error);
    }
  };

  // Discussion Card Component
  const DiscussionCard = ({ post }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(false);

    const handleAddComment = async (e) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      try {
        const response = await axiosInstance.post(`/discussions/${post._id}/comments`, {
          content: newComment
        });

        setDiscussions(discussions.map(discussion => 
          discussion._id === post._id ? {
            ...response.data,
            comments: response.data.comments.length,
            isBookmarked: response.data.isBookmarked.includes(currentUser.userId)
          } : discussion
        ));
        setNewComment('');
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    };

    return (
      <div className="US2-discussion-card">
        <div className="US2-card-header">
          <div className="US2-user-info">
            <div className="US2-user-meta">
              <div className="US2-name-container">
                <h4>{post.user.name || 'Anonymous'}</h4>
              </div>
              <div className="US2-post-meta">
                <span className="US2-category">{post.category}</span>
                <span className="US2-time">
                  <Clock size={14} />
                  <span>{new Date(post.timePosted).toLocaleString()}</span>
                </span>
              </div>
            </div>
          </div>
          <button className="US2-bookmark-btn" onClick={() => handleBookmark(post._id)}>
            {post.isBookmarked ? 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#4a6cf7" stroke="#4a6cf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg> :
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            }
          </button>
        </div>
        
        <div className="US2-card-content">
          <h3 className="US2-post-title">{post.title}</h3>
          <p className={`US2-post-text ${isExpanded ? 'US2-expanded' : ''}`}>
            {post.content}
          </p>
          {post.content.length > 200 && !isExpanded && (
            <button 
              className="US2-read-more" 
              onClick={() => setIsExpanded(true)}
            >
              Read more
            </button>
          )}
          
          <div className="US2-tags">
            {post.tags.map(tag => (
              <span key={tag} className="US2-tag">#{tag}</span>
            ))}
          </div>
        </div>
        
        <div className="US2-card-actions">
          <button className="US2-action-btn" onClick={() => handleLike(post._id)}>
            <ThumbsUp size={18} />
            <span>{post.likes}</span>
          </button>
          <button className="US2-action-btn" onClick={() => setShowComments(!showComments)}>
            <MessageCircle size={18} />
            <span>{post.comments}</span>
          </button>
          <button className="US2-action-btn">
            <Share2 size={18} />
            <span>{post.shares}</span>
          </button>
          <button className="US2-action-btn US2-report">
            <Flag size={18} />
          </button>
        </div>
        
        {showComments && (
          <div className="US2-comments-section">
            {post.comments.length > 0 && (
              <div className="US2-comments-list">
                {post.comments.map(comment => (
                  <div className="US2-comment" key={comment._id}>
                    <div className="US2-comment-header">
                      <div className="US2-comment-meta">
                        <h5>{comment.user.name || 'Anonymous'}</h5>
                        <span className="US2-comment-time">
                          {new Date(comment.timePosted).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="US2-comment-content">{comment.content}</p>
                    <div className="US2-comment-actions">
                      <button className="US2-comment-like">
                        <ThumbsUp size={14} />
                        <span>{comment.likes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <form className="US2-comment-form" onSubmit={handleAddComment}>
              <div className="US2-comment-input-container">
                <span className="US2-current-user-name">{currentUser.name || 'Anonymous'}</span>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="US2-comment-input"
                />
              </div>
              <button type="submit" className="US2-post-comment-btn">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    );
  };

  if (!currentUser.token) {
    return (
      <div className="US2-community-discussion-container">
        <h3>Please log in to view community discussions.</h3>
      </div>
    );
  }

  return (
    <div className="US2-community-discussion-container">
      <div className="US2-content-header">
        <div className="US2-header-main">
          <h1 className="US2-page-title">Community Discussions</h1>
          <p className="US2-page-description">
            Connect with others, share experiences, and find solutions to your financial challenges.
          </p>
        </div>
        
        <div className="US2-search-box">
          <Search size={18} className="US2-search-icon" />
          <input 
            type="text" 
            placeholder="Search discussions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="US2-search-input"
          />
        </div>
      </div>
      
      <div className="US2-create-post">
        <div className="US2-post-input-container">
          <span className="US2-user-name">{currentUser.name || 'Anonymous'}</span>
          <form onSubmit={handleCreatePost} className="US2-post-form">
            <textarea
              placeholder="Share your thoughts, questions, or insights..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="US2-post-textarea"
            />
            <div className="US2-post-actions">
              <button type="submit" className="US2-publish-btn" disabled={!newPost.trim()}>
                Publish
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="US2-filters-container">
        <div className="US2-category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`US2-category-filter ${filterCategory === category.id ? 'US2-active' : ''}`}
              onClick={() => setFilterCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="US2-tabs">
          <button
            className={`US2-tab ${activeTab === 'trending' ? 'US2-active' : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            Trending
          </button>
          <button
            className={`US2-tab ${activeTab === 'recent' ? 'US2-active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recent
          </button>
          <button
            className={`US2-tab ${activeTab === 'bookmarked' ? 'US2-active' : ''}`}
            onClick={() => setActiveTab('bookmarked')}
          >
            Bookmarked
          </button>
        </div>
      </div>
      
      <div className="US2-discussions-list">
        {loading ? (
          <div>Loading discussions...</div>
        ) : error ? (
          <div className="US2-no-results">
            <h3>{error}</h3>
          </div>
        ) : discussions.length > 0 ? (
          discussions.map(post => (
            <DiscussionCard key={post._id} post={post} />
          ))
        ) : (
          <div className="US2-no-results">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            <h3>No discussions found</h3>
            <p>Try adjusting your search or filters, or start a new discussion!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDiscussion;