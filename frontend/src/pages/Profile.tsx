import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setForm({ username: user.username, email: user.email });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/users/profile', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err) {
      const error = err as any;
      setError(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account?')) return;
    setLoading(true);
    setError('');
    try {
      await api.delete('/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      await logout();
      navigate('/register');
    } catch (err) {
      const error = err as any;
      setError(error.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Please log in to view your profile.</div>;

  return (
    <div className="profile-page">
      <h2>User Profile</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <form onSubmit={handleUpdate}>
        <div>
          <label>Username:</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          {editMode ? (
            <>
              <button type="submit" disabled={loading}>Save</button>
              <button type="button" onClick={() => setEditMode(false)} disabled={loading}>Cancel</button>
            </>
          ) : (
            <button type="button" onClick={() => setEditMode(true)}>Edit Profile</button>
          )}
        </div>
      </form>
      <div style={{ marginTop: 24 }}>
        <button onClick={logout}>Logout</button>
        <button onClick={handleDelete} style={{ color: 'red', marginLeft: 8 }}>Delete Account</button>
      </div>
    </div>
  );
};

export default Profile;
