import axios from 'axios';

const baseURL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3000/api/v1'
    : '/api/v1';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
