import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const setToken = (token) => {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const register = (email, password) =>
  axios.post(`${API_URL}/auth/register`, { email, password });

export const login = (email, password) =>
  axios.post(`${API_URL}/auth/login`, new URLSearchParams({
    username: email,
    password: password,
  }));

export const uploadZip = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(`${API_URL}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getJobStatus = (job_id) =>
  axios.get(`${API_URL}/job/${job_id}`);