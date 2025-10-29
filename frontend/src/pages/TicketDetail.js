import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTicketData();
    fetchAdmins();
  }, [id]);

  const fetchTicketData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tickets/${id}`);
      setTicket(response.data.ticket);
      setComments(response.data.comments);
      setAttachments(response.data.attachments);
    } catch (error) {
      toast.error('Error fetching ticket');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users', { params: { role: 'IT Admin' } });
      setAdmins(res.data);
    } catch (e) {
      // ignore silently for UI
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/comments', {
        ticket: id,
        comment: commentText,
        isInternal
      });
      
      setComments([response.data, ...comments]);
      setCommentText('');
      setIsInternal(false);
      toast.success('Comment added');
    } catch (error) {
      toast.error('Error adding comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/tickets/${id}`, {
        status: newStatus
      });
      setTicket(response.data);
      toast.success('Status updated');
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const handleReassign = async (newAssignee) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/tickets/${id}/reassign`, {
        assignedTo: newAssignee
      });
      setTicket(response.data);
      toast.success('Ticket reassigned');
    } catch (error) {
      toast.error('Error reassigning ticket');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('ticket', id);

    try {
      const response = await axios.post('http://localhost:5000/api/attachments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAttachments([response.data, ...attachments]);
      toast.success('File uploaded');
    } catch (error) {
      toast.error('Error uploading file');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-white" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return <div className="text-center py-5">
      <p className="text-white">Ticket not found</p>
      <button className="btn btn-light" onClick={() => navigate('/')}>
        Back to Dashboard
      </button>
    </div>;
  }

  const isAdmin = user?.role === 'IT Admin';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white">{ticket.title}</h2>
        <button className="btn btn-light" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left me-1"></i> Back
        </button>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card bg-white shadow-sm mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Ticket Details</h5>
              <span className={`badge bg-${ticket.status === 'Completed' ? 'success' : 'primary'}`}>
                {ticket.status}
              </span>
            </div>
            <div className="card-body">
              <p className="text-muted">Description:</p>
              <p>{ticket.description}</p>

              <div className="mt-4">
                <p className="text-muted mb-2">Attachments ({attachments.length})</p>
                <input 
                  type="file" 
                  className="form-control mb-3" 
                  onChange={handleFileUpload}
                />
                {attachments.map(att => (
                  <div key={att._id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <span>
                      <i className="bi bi-paperclip me-2"></i>
                      {att.filename}
                    </span>
                    <a 
                      href={`http://localhost:5000/api/attachments/${att._id}/download`}
                      className="btn btn-sm btn-outline-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h6 className="mb-3">Comments ({comments.length})</h6>
                
                {(user?.role === 'IT Admin' || user?.role === 'Senior Admin') && (
                  <div className="mb-3">
                    <form onSubmit={handleCommentSubmit}>
                      <textarea
                        className="form-control mb-2"
                        rows="3"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          id="internal"
                        />
                        <label className="form-check-label" htmlFor="internal">
                          Internal note (not visible to employee)
                        </label>
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={submitting}
                      >
                        {submitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="comments-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {comments.map(comment => (
                    <div key={comment._id} className={`border-start border-3 p-3 mb-3 ${comment.isInternal ? 'bg-warning bg-opacity-10' : 'bg-light'}`}>
                      <div className="d-flex justify-content-between mb-2">
                        <strong>{comment.user.name}</strong>
                        <small className="text-muted">
                          {new Date(comment.createdAt).toLocaleString()}
                        </small>
                      </div>
                      <p className="mb-0">{comment.comment}</p>
                      {comment.isInternal && (
                        <span className="badge bg-warning text-dark mt-2">Internal Note</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-white shadow-sm mb-3">
            <div className="card-header">
              <h6 className="mb-0">Ticket Information</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong className="text-muted">Ticket Code:</strong>
                <p className="mb-0">
                  <span className="badge bg-primary fs-6">{ticket.ticketCode}</span>
                </p>
              </div>

              <div className="mb-3">
                <strong className="text-muted">Priority:</strong>
                <span className={`badge ms-2 bg-${ticket.priority === 'Urgent' ? 'danger' : ticket.priority === 'High' ? 'warning' : 'info'}`}>
                  {ticket.priority}
                </span>
              </div>

              <div className="mb-3">
                <strong className="text-muted">Status:</strong>
                <p className="mb-0">{ticket.status}</p>
              </div>

              <div className="mb-3">
                <strong className="text-muted">Created By:</strong>
                <p className="mb-0">{ticket.createdBy?.name || 'Unknown'}</p>
              </div>

              <div className="mb-3">
                <strong className="text-muted">Created Date:</strong>
                <p className="mb-0">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>

              {(isAdmin) && (
                <>
                  <div className="mb-3">
                    <strong className="text-muted">Assigned To:</strong>
                    <p className="mb-0">{ticket.assignedTo?.name || 'Unassigned'}</p>
                  </div>

                  <hr />

                  <div className="mb-3">
                    <label className="form-label">Change Status</label>
                    <select 
                      className="form-select"
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <option value="New">New</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                      <option value="In Review">In Review</option>
                      <option value="Completed">Completed</option>
                      <option value="Reopened">Reopened</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Assign To</label>
                    <select
                      className="form-select"
                      value={ticket.assignedTo?._id || ''}
                      onChange={(e) => handleReassign(e.target.value || null)}
                    >
                      <option value="">Unassigned</option>
                      {admins.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.name} ({a.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;

