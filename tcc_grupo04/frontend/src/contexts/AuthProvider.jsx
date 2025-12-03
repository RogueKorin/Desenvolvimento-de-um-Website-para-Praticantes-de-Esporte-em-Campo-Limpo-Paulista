  import React, { createContext, useState, useEffect, useContext } from "react";
  import axios from 'axios';

  const API_URL = 'http://localhost:4000/api'; 

  export const AuthContext = createContext(null);

  export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async (userToken) => {
      try {
        const res = await axios.get(`${API_URL}/usuarios/me`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        });
        return res.data;
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err);
        return null;
      }
    };

    const login = async (email, senha) => {
      setLoading(true);
      try {
        const res = await axios.post(`${API_URL}/auth/login`, { email, senha });
        const userToken = res.data.token;
        
        const userData = await fetchUser(userToken);
        if (userData) {
          setToken(userToken);
          setUsuario(userData);
          localStorage.setItem("token", userToken);
          localStorage.setItem("usuario", JSON.stringify(userData));
        } else {
          // Se a busca pelo usuário falhar, consideramos o login inválido
          throw new Error("Falha ao obter dados do usuário.");
        }
        return res.data;
      } catch (err) {
        console.error("Erro no login:", err);
        // ----------------------------------------------------------------
        // MODIFICAÇÃO CHAVE: Lançar o erro para que o componente 'entrar.jsx' possa
        // capturá-lo no bloco try-catch e exibir a mensagem de erro.
        // ----------------------------------------------------------------
        throw err; 
      } finally {
        setLoading(false);
      }
    };

    const logout = () => {
      setToken(null);
      setUsuario(null);
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
    };

    useEffect(() => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const checkAuthStatus = async () => {
          const userData = await fetchUser(storedToken);
          if (userData) {
            setToken(storedToken);
            setUsuario(userData);
            localStorage.setItem("usuario", JSON.stringify(userData));
          } else {
            logout();
          }
          setLoading(false);
        };
        checkAuthStatus();
      } else {
        setLoading(false);
      }
    }, []);

    return (
      <AuthContext.Provider value={{ token, usuario, setUsuario, loading, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };

  export const useAuth = () => {
    return useContext(AuthContext);
  };