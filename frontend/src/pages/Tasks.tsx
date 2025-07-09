import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
}

interface Priority {
  id: number;
  name: string;
  level: number;
}

const Tasks: React.FC = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [filters, setFilters] = useState({ status: 'all', priority: '', due: '', search: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', priority: '', category: '', due_date: '' });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters };
      const res = await api.get('/tasks', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setTasks(res.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories', { headers: { Authorization: `Bearer ${token}` } });
      setCategories(res.data);
    } catch {}
  };

  const fetchPriorities = async () => {
    try {
      const res = await api.get('/priorities', { headers: { Authorization: `Bearer ${token}` } });
      setPriorities(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchTasks();
    fetchCategories();
    fetchPriorities();
    // eslint-disable-next-line
  }, [filters, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/tasks', form, { headers: { Authorization: `Bearer ${token}` } });
      setForm({ title: '', description: '', priority: '', category: '', due_date: '' });
      fetchTasks();
    } catch {
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      category: task.category,
      due_date: task.due_date,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setLoading(true);
    setError('');
    try {
      await api.put(`/tasks/${editId}`, form, { headers: { Authorization: `Bearer ${token}` } });
      setEditId(null);
      setForm({ title: '', description: '', priority: '', category: '', due_date: '' });
      fetchTasks();
    } catch {
      setError('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this task?')) return;
    setLoading(true);
    setError('');
    try {
      await api.delete(`/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchTasks();
    } catch {
      setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id: number, completed: boolean) => {
    setLoading(true);
    setError('');
    try {
      await api.patch(`/tasks/${id}/${completed ? 'incomplete' : 'complete'}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchTasks();
    } catch {
      setError('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tasks-page">
      <h2>Task Management</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={editId ? handleUpdate : handleCreate}>
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option value="">Priority</option>
          {priorities.map((p) => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <input type="date" name="due_date" value={form.due_date} onChange={handleChange} />
        <button type="submit" disabled={loading}>{editId ? 'Update' : 'Create'} Task</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ title: '', description: '', priority: '', category: '', due_date: '' }); }}>Cancel</button>}
      </form>
      <div style={{ margin: '16px 0' }}>
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>
        <select name="priority" value={filters.priority} onChange={handleFilterChange}>
          <option value="">All Priorities</option>
          {priorities.map((p) => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
        <select name="due" value={filters.due} onChange={handleFilterChange}>
          <option value="">All Due Dates</option>
          <option value="today">Today</option>
          <option value="this_week">This Week</option>
          <option value="overdue">Overdue</option>
        </select>
        <input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search..." />
      </div>
      {loading ? <div>Loading...</div> : (
        <table border={1} cellPadding={8} style={{ width: '100%', marginTop: 16 }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Due Date</th>
              <th>Completed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} style={{ background: task.completed ? '#e0ffe0' : undefined }}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>{task.priority}</td>
                <td>{task.category}</td>
                <td>{task.due_date}</td>
                <td>
                  <input type="checkbox" checked={task.completed} onChange={() => handleComplete(task.id, task.completed)} />
                </td>
                <td>
                  <button onClick={() => handleEdit(task)}>Edit</button>
                  <button onClick={() => handleDelete(task.id)} style={{ color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Tasks;
