import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const response = await axios.get('http://localhost:5000/api/tickets', { params });
      setTickets(response.data.tickets);
    } catch (error) {
      toast.error('Error fetching tickets');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      'Low': 'bg-secondary',
      'Medium': 'bg-info',
      'High': 'bg-warning',
      'Urgent': 'bg-danger'
    };
    return badges[priority] || 'bg-secondary';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'New': 'bg-secondary',
      'Assigned': 'bg-primary',
      'In Progress': 'bg-info',
      'Done': 'bg-success',
      'In Review': 'bg-warning',
      'Completed': 'bg-success',
      'Reopened': 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white">My Tickets</h2>
        <Link to="/create-ticket" className="btn btn-light">
          <i className="bi bi-plus-circle me-1"></i> Create New Ticket
        </Link>
      </div>

      <div className="card bg-white shadow-sm mb-3">
        <div className="card-body">
          <div className="btn-group" role="group">
            <button 
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`btn ${filter === 'New' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('New')}
            >
              New
            </button>
            <button 
              className={`btn ${filter === 'In Progress' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('In Progress')}
            >
              In Progress
            </button>
            <button 
              className={`btn ${filter === 'Completed' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('Completed')}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-white shadow-sm">
        <div className="card-body">
          {tickets.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <p className="text-muted mt-3">No tickets found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket Code</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr key={ticket._id}>
                      <td className="fw-semibold text-primary">{ticket.ticketCode}</td>
                      <td>{ticket.title}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                      <td>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/tickets/${ticket._id}`} className="btn btn-sm btn-outline-primary">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTickets;

