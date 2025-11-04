import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import API_BASE_URL from '../config/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`, { params: { role: 'IT Admin' } });
      setAdmins(res.data);
    } catch (e) {
      // ignore
    }
  };

  const fetchData = async () => {
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (assigneeFilter) params.assignedTo = assigneeFilter;

      const [statsRes, ticketsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/users/stats/dashboard`),
        axios.get(`${API_BASE_URL}/api/tickets`, { params })
      ]);

      setStats(statsRes.data);
      setTickets(ticketsRes.data.tickets);
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (!loading) {
        fetchData();
      }
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, statusFilter, priorityFilter, assigneeFilter]);

  // Real-time: refresh tickets list when a new ticket is created (admin only)
  useEffect(() => {
    if (!socket || user?.role !== 'IT Admin') return;
    const handler = () => {
      fetchData();
    };
    socket.on('ticket:created', handler);
    return () => socket.off('ticket:created', handler);
  }, [socket, user, searchQuery, statusFilter, priorityFilter, assigneeFilter]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-white" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const statusBadge = (status) => {
    switch (status) {
      case 'Completed':
      case 'Done':
        return 'success';
      case 'In Progress':
        return 'info';
      case 'Assigned':
      case 'In Review':
        return 'primary';
      case 'Reopened':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const priorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'danger';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const countByStatus = (status) => {
    const arr = stats?.ticketsByStatus || [];
    const found = arr.find(s => s._id === status);
    return found ? found.count : 0;
  };

  return (
    <div>
      <h2 className="text-white mb-4">Admin Dashboard</h2>

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card bg-white shadow-sm h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted mb-1">Total Tickets</p>
                <h3 className="mb-0">{stats?.totalTickets || 0}</h3>
              </div>
              <i className="bi bi-ticket-perforated fs-1 text-primary"></i>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card bg-white shadow-sm h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted mb-1">New Tickets</p>
                <h3 className="mb-0">{countByStatus('New')}</h3>
              </div>
              <i className="bi bi-file-earmark-plus fs-1 text-info"></i>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <div className="card bg-white shadow-sm h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted mb-1">Completed</p>
                <h3 className="mb-0">{countByStatus('Completed')}</h3>
              </div>
              <i className="bi bi-check-circle fs-1 text-success"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="card bg-white shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by ticket code, title, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-4">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="bi bi-funnel me-2"></i>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="row g-3 mt-2">
              <div className="col-12 col-md-4">
                <label className="form-label">Assignee</label>
                <select
                  className="form-select"
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                >
                  <option value="">All Assignees</option>
                  {admins.map(a => (
                    <option value={a._id} key={a._id}>{a.name} ({a.email})</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                  <option value="Reopened">Reopened</option>
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12">
          <div className="card bg-white shadow-sm mb-3">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">All Tickets ({tickets.length})</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Ticket Code</th>
                      <th style={{minWidth: '220px'}}>Title</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assigned To</th>
                      <th>Created</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <i className="bi bi-inbox fs-1 text-muted"></i>
                          <p className="text-muted mt-2">No tickets found</p>
                        </td>
                      </tr>
                    ) : (
                      tickets.map(ticket => (
                        <tr key={ticket._id}>
                          <td className="fw-semibold text-primary">{ticket.ticketCode}</td>
                          <td className="fw-semibold">{ticket.title}</td>
                        <td>
                          <span className={`badge bg-${statusBadge(ticket.status)}`}>{ticket.status}</span>
                        </td>
                        <td>
                          <span className={`badge bg-${priorityBadge(ticket.priority)}`}>{ticket.priority}</span>
                        </td>
                        <td>{ticket.assignedTo?.name || 'Unassigned'}</td>
                        <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                        <td className="text-end">
                          <Link to={`/tickets/${ticket._id}`} className="btn btn-sm btn-outline-primary">
                            View
                          </Link>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

