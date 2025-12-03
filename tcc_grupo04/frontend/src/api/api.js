// Arquivo: api.js (CORRIGIDO)

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api", // Porta do backend
});

// APLICAÇÃO DO INTERCEPTOR DE REQUISIÇÕES
api.interceptors.request.use(
  (config) => {
    // Pega o token persistente (salvo pelo AuthProvider)
    const token = localStorage.getItem('token'); 
    
    // Injeta o token automaticamente no cabeçalho de TODAS as requisições
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;