import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const IT_ADMIN_EMAILS = [
  'sunil.marand@injala.com',
  'siddhant.chavadiya@injala.com',
  'dhruv.vekariya@injala.com',
  'jignesh.radadiya@injala.com',
];
const EMPLOYEE_PW_EMAILS = [
  'employee1@injala.com',
  'employee2@injala.com',
];

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const lower = formData.email.trim().toLowerCase();
    setShowPassword(
      IT_ADMIN_EMAILS.includes(lower) || EMPLOYEE_PW_EMAILS.includes(lower)
    );
  }, [formData.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const result = await login(
        normalizedEmail,
        undefined, // No display name
        undefined, // No azure ID
        undefined,
        formData.password
      );
      if (result.success) {
        toast.success('Login successful');
        navigate('/');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg" style={{ width: '500px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <i className="bi bi-ticket-perforated fs-1 text-primary"></i>
            <h2 className="mt-3">Injala IT Support</h2>
            <p className="text-muted">Login with your Microsoft account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={showPassword} // Required for admin/emp; still always shown
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

