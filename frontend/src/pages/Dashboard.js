import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    new: 0,
    assigned: 0,
    inProgress: 0,
    done: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tickets');
      setTickets(response.data.tickets);
      setCounts(response.data.counts);
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
      <div className="mb-4">
        <h1 className="text-white">
          Welcome, {user?.name}
        </h1>
        <p className="text-white opacity-75">Dashboard Overview</p>
      </div>

      {user?.role === 'Employee' ? (
        <>
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card bg-white shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-0">Total Tickets</h6>
                      <h2 className="mt-2 mb-0">{counts.total}</h2>
                    </div>
                    <i className="bi bi-ticket-perforated fs-1 text-primary"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-white shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-0">New Tickets</h6>
                      <h2 className="mt-2 mb-0">{counts.new}</h2>
                    </div>
                    <i className="bi bi-file-earmark-plus fs-1 text-info"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-white shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-0">Completed</h6>
                      <h2 className="mt-2 mb-0">{counts.completed}</h2>
                    </div>
                    <i className="bi bi-check-circle fs-1 text-success"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Tickets</h5>
              <Link to="/create-ticket" className="btn btn-primary btn-sm">
                <i className="bi bi-plus-circle me-1"></i> Create New Ticket
              </Link>
            </div>
            <div className="card-body">
              {tickets.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox fs-1 text-muted"></i>
                  <p className="text-muted mt-3">No tickets yet</p>
                  <Link to="/create-ticket" className="btn btn-primary">
                    Create Your First Ticket
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.slice(0, 10).map(ticket => (
                        <tr key={ticket._id}>
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
        </>
      ) : (
        <div className="row">
          <div className="col-md-3">
            <div className="card bg-white shadow-sm mb-3">
              <div className="card-body">
                <h6 className="text-muted mb-2">Total Open</h6>
                <h2 className="mb-0">{counts.total}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-white shadow-sm mb-3">
              <div className="card-body">
                <h6 className="text-muted mb-2">New</h6>
                <h2 className="mb-0">{counts.new}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-white shadow-sm mb-3">
              <div className="card-body">
                <h6 className="text-muted mb-2">In Progress</h6>
                <h2 className="mb-0">{counts.inProgress}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-white shadow-sm mb-3">
              <div className="card-body">
                <h6 className="text-muted mb-2">Completed</h6>
                <h2 className="mb-0">{counts.completed}</h2>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

