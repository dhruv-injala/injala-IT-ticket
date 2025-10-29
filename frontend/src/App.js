import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import MyTickets from './pages/MyTickets';
import AdminDashboard from './pages/AdminDashboard';
import AuditLogs from './pages/AuditLogs';
import NotificationCenter from './components/NotificationCenter';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/my-tickets" element={
              <PrivateRoute>
                <Layout>
                  <MyTickets />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/create-ticket" element={
              <PrivateRoute>
                <Layout>
                  <CreateTicket />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/tickets/:id" element={
              <PrivateRoute>
                <Layout>
                  <TicketDetail />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute allowedRoles={['IT Admin']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <ToastContainer position="top-right" />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

