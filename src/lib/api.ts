import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If 401 Unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions for ByteBoard

// Posts
export const getPosts = () => api.get("/posts");
export const getPost = (postId: number) => api.get(`/posts/${postId}`);
export const createPost = (title: string, content: string) =>
  api.post("/posts", { title, content });
export const updatePost = (postId: number, title: string, content: string) =>
  api.put(`/posts/${postId}`, { title, content });
export const deletePost = (postId: number) => api.delete(`/posts/${postId}`);

// Comments
export const getComments = (postId: number) =>
  api.get(`/posts/${postId}/comments`);
export const createComment = (postId: number, content: string) =>
  api.post(`/posts/${postId}/comments`, { content });
export const updateComment = (commentId: number, content: string) =>
  api.put(`/comments/${commentId}`, { content });
export const deleteComment = (commentId: number) =>
  api.delete(`/comments/${commentId}`);

// Profiles
export const getProfiles = () => api.get("/profiles");
export const getProfile = (userId: number) => api.get(`/profiles/${userId}`);
export const updateProfile = (
  userId: number,
  data: {
    first_name: string;
    last_name: string;
    email: string;
    github_link: string;
    city: string;
    state: string;
  }
) => api.put(`/profiles/${userId}`, data);

// Admin
export const getAllUsers = () => api.get("/admin/users");

// User posts
export const getPostsByUser = (userId: number) =>
  api.get(`/posts/user/${userId}`)