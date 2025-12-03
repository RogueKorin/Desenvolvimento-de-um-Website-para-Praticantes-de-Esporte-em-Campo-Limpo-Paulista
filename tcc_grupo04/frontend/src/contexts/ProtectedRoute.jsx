import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

// Adicionamos a prop 'allowedRoles'
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { usuario, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Carregando...</div>;
  }

  // Se o usuário não estiver logado, redireciona para a página de login
  if (!usuario) {
    return <Navigate to="/entrar" replace />;
  }

  // Se a rota tem funções específicas, verifica se a função do usuário está entre elas
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(usuario.tipo)) {
      // Se a função do usuário não é permitida, redireciona para a página inicial
      return <Navigate to="/" replace />;
    }
  }

  // Se tudo estiver certo, renderiza o componente filho
  return children;
};

export default ProtectedRoute;