import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('http://localhost:5000/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
      <button
        className="btn btn-primary btn-lg rounded-circle shadow-lg"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ width: '60px', height: '60px' }}
      >
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="position-absolute bottom-100 end-0 mb-2 shadow-lg rounded" 
             style={{ width: '350px', maxHeight: '500px', backgroundColor: 'white' }}>
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Notifications</h6>
              {unreadCount > 0 && (
                <button className="btn btn-sm btn-link" onClick={markAllAsRead}>
                  Mark all as read
                </button>
              )}
            </div>
            <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div className="text-center p-4 text-muted">
                  <i className="bi bi-inbox fs-1"></i>
                  <p className="mt-2">No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 10).map(notif => (
                  <div 
                    key={notif._id} 
                    className={`p-3 border-bottom ${!notif.isRead ? 'bg-light' : ''}`}
                    onClick={() => markAsRead(notif._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h6 className="mb-1">{notif.title}</h6>
                    <p className="text-muted small mb-1">{notif.message}</p>
                    <small className="text-muted">
                      {new Date(notif.createdAt).toLocaleString()}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

