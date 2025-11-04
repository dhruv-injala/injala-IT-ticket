import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { loading: authLoading } = useAuth();
  const [filters, setFilters] = useState({
    action: '',
    user: '',
    startDate: '',
    endDate: '',
    limit: '500'
  });
  const [users, setUsers] = useState([]);

  const fetchLogs = useCallback(async () => {
    try {
      const params = {};
      if (filters.action) params.action = filters.action;
      if (filters.user) params.user = filters.user;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.limit) params.limit = filters.limit;

      const response = await axios.get(`${API_BASE_URL}/api/audit`, { params });
      setLogs(response.data);
    } catch (error) {
      toast.error('Error fetching audit logs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    fetchLogs();
  }, [fetchLogs, authLoading]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`);
      setUsers(res.data);
    } catch (e) {
      // ignore selector load failure
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white">Audit Logs</h2>
      </div>

      <div className="card bg-white shadow-sm mb-3">
        <div className="card-header">
          <h6 className="mb-0">Filters</h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <label className="form-label">Action</label>
              <input
                type="text"
                className="form-control"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                placeholder="Filter by action"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">User</label>
              <select
                className="form-select"
                value={filters.user}
                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              >
                <option value="">All Users</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div className="col-md-2 mt-3">
              <label className="form-label">Limit</label>
              <select
                className="form-select"
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
              >
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">&nbsp;</label>
              <button
                className="btn btn-secondary w-100"
                onClick={() => setFilters({ action: '', user: '', startDate: '', endDate: '', limit: '500' })}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-white shadow-sm">
        <div className="card-body">
          {logs.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <p className="text-muted mt-3">No audit logs found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Description</th>
                    <th>Ticket</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log._id}>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                      <td>{log.user?.name || 'Unknown'}</td>
                      <td>
                        <span className="badge bg-info">{log.action}</span>
                      </td>
                      <td>{log.description}</td>
                      <td>
                        {log.ticket ? (
                          <a href={`/tickets/${log.ticket._id}`} className="text-decoration-none">
                            {log.ticket.title}
                          </a>
                        ) : (
                          '-'
                        )}
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

export default AuditLogs;

