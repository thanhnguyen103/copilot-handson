import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  completed?: boolean;
  status?: string;
  priority_id?: number;
  category_id?: number;
  priority_name?: string;
  category_name?: string;
  priority?: { id: number; name: string; level: number };
  category?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

const Tasks: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    priority_id: '',
    due: '',
    search: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority_id: '',
    category_id: '',
    due_date: '',
  });
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
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to fetch tasks');
      setTasks([]); // fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const categories = Array.isArray(res.data) ? res.data : [];
      console.log('Fetched categories:', categories);
      setCategories(categories);
    } catch {
      setError('Failed to fetch categories');
      setCategories([]); // fallback to empty array on error
    }
  };

  const fetchPriorities = async () => {
    try {
      const res = await api.get('/priorities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPriorities(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPriorities([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCategories();
    fetchPriorities();
    // eslint-disable-next-line
  }, [filters, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post(
        '/tasks',
        {
          ...form,
          priority:
            priorities.find((p) => String(p.id) === String(form.priority_id))
              ?.name || '',
          category:
            categories.find((c) => String(c.id) === String(form.category_id))
              ?.name || '',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setForm({
        title: '',
        description: '',
        priority_id: '',
        category_id: '',
        due_date: '',
      });
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
      priority_id:
        task.priority_id?.toString() || task.priority?.id?.toString() || '',
      category_id:
        task.category_id?.toString() || task.category?.id?.toString() || '',
      due_date: task.due_date
        ? new Date(task.due_date).toISOString().slice(0, 10)
        : '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setLoading(true);
    setError('');
    try {
      await api.put(
        `/tasks/${editId}`,
        {
          ...form,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setEditId(null);
      setForm({
        title: '',
        description: '',
        priority_id: '',
        category_id: '',
        due_date: '',
      });
      await fetchTasks();
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
      await api.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      await api.patch(
        `/tasks/${id}/${completed ? 'incomplete' : 'complete'}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchTasks();
    } catch {
      setError('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Header section */}
      <header className="flex items-center justify-between max-w-7xl mx-auto mb-8 p-4 bg-white rounded-lg shadow">
        <div className="font-semibold text-blue-700 text-lg">
          Task Management
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-gray-700">
              Welcome, {user.username || user.email}
            </span>
          )}
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-gray-900 font-semibold rounded hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2">
            Logout
          </button>
        </div>
      </header>
      <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
        {/* Left: Task List and Filters */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="border rounded px-2 py-1 text-sm">
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="incomplete">Incomplete</option>
              </select>
              <select
                name="priority_id"
                value={filters.priority_id}
                onChange={handleFilterChange}
                className="border rounded px-2 py-1 text-sm">
                <option value="">All Priorities</option>
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                name="due"
                value={filters.due}
                onChange={handleFilterChange}
                className="border rounded px-2 py-1 text-sm">
                <option value="">All Due Dates</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="overdue">Overdue</option>
              </select>
              <input
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search..."
                className="border rounded px-2 py-1 text-sm flex-1"
              />
            </div>
            {error && <div className="mb-4 text-red-600">{error}</div>}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-3 text-left">Title</th>
                      <th className="py-2 px-3 text-left">Description</th>
                      <th className="py-2 px-3 text-left">Priority</th>
                      <th className="py-2 px-3 text-left">Category</th>
                      <th className="py-2 px-3 text-left">Due Date</th>
                      <th className="py-2 px-3 text-center">Completed</th>
                      <th className="py-2 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr
                        key={task.id}
                        className={task.completed ? 'bg-green-50' : ''}>
                        <td className="py-2 px-3">{task.title}</td>
                        <td className="py-2 px-3">{task.description}</td>
                        <td className="py-2 px-3">
                          {task.priority?.name || task.priority_name || ''}
                        </td>
                        <td className="py-2 px-3">
                          {task.category?.name || task.category_name || ''}
                        </td>
                        <td className="py-2 px-3">
                          {task.due_date
                            ? new Date(task.due_date).toISOString().slice(0, 10)
                            : ''}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={
                              task.completed ?? task.status === 'completed'
                            }
                            onChange={() =>
                              handleComplete(
                                task.id,
                                task.completed ?? task.status === 'completed',
                              )
                            }
                          />
                        </td>
                        <td className="py-2 px-3 text-center space-x-2">
                          {!(task.completed ?? task.status === 'completed') && (
                            <button
                              className="text-blue-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                              onClick={() => handleEdit(task)}
                              title="Edit">
                              <EditIcon fontSize="small" />
                            </button>
                          )}
                          <button
                            className="text-red-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                            onClick={() => handleDelete(task.id)}
                            title="Delete">
                            <DeleteIcon fontSize="small" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tasks.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No tasks found.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Right: Create/Edit Task Form */}
        <div className="w-full md:w-96">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">
              {editId ? 'Edit Task' : 'Create Task'}
            </h3>
            <form
              onSubmit={editId ? handleUpdate : handleCreate}
              className="space-y-3">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Title"
                required
                className="w-full border rounded px-3 py-2"
              />
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full border rounded px-3 py-2"
              />
              <select
                name="priority_id"
                value={form.priority_id}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2">
                <option value="">Priority</option>
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2">
                <option value="">Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-gray-900 font-semibold py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                  {editId ? 'Update' : 'Create'} Task
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(null);
                      setForm({
                        title: '',
                        description: '',
                        priority_id: '',
                        category_id: '',
                        due_date: '',
                      });
                    }}
                    className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
