// startando: back - node app / front - npm run 

import './App.css'

// Importações de páginas
import Introducao from './pages/nao logado/introducao.jsx'
import Cadastro from './pages/nao logado/cadastro.jsx'
import Entrar from './pages/nao logado/entrar.jsx';

import Home from './pages/praticante/home.jsx';

import Chat from './pages/praticante/utilidades/comunidades/chat.jsx';
import Comunidades from './pages/praticante/utilidades/comunidades/comunidades.jsx';

import Locais from './pages/praticante/utilidades/locais/locais.jsx';
import AgendaCalendar from './pages/praticante/utilidades/agenda/AgendaCalendar';
import Eventos from "./pages/praticante/utilidades/eventos/eventos.jsx";

import UserProfile from './pages/praticante/minha conta/UserProfile.jsx';

import { Routes, Route } from 'react-router-dom';

// Importando o AuthProvider e o ProtectedRoute
import { AuthProvider } from "./contexts/AuthProvider.jsx"; 
import ProtectedRoute from './contexts/ProtectedRoute';
import CriarEventos from './pages/praticante/utilidades/eventos/criarEventos.jsx';
import Usuarios from './pages/adm/Usuarios.jsx';
import CriarComunidade from './pages/praticante/utilidades/comunidades/criarcomunidade.jsx';
import ComunidadesAdmin from './pages/adm/comunidadesAdmin.jsx';

function App() {

  // Defina a(s) role(s) permitida(s) para os usuários logados
  const perm = ['comum', 'admin'];

  return (
    <>
    <AuthProvider>
      <Routes>
        {/* ROTAS PÚBLICAS (Abaixo os links para users nao logados) */}
        <Route path="/" element={<Introducao/>} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/entrar" element={<Entrar />} />

        {/* ROTAS PROTEGIDAS (Abaixo as rotas para users logados) */}
        
        {/* Rota Home */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute allowedRoles={perm}>
              <Home/>
            </ProtectedRoute>
          } 
        />

        {/* Fluxo de Comunidades */}
        <Route 
          path="/comunidades" 
          element={
            <ProtectedRoute allowedRoles={perm}>
              <Comunidades/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/conversas"
          element={
            <ProtectedRoute allowedRoles={perm}>
              <Chat/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/comunidades/criar"
          element={
            <ProtectedRoute allowedRoles={perm}>
              <CriarComunidade/>
            </ProtectedRoute>
          }
        />

        {/* Fluxo de Locais */}
        <Route 
          path="/locais"
          element={
            <ProtectedRoute allowedRoles={perm}>
              <Locais/>
            </ProtectedRoute>
          }
        />
        {/* Agenda */}
        <Route 
          path="/agenda" 
          element={
            <ProtectedRoute allowedRoles={perm}>
              <AgendaCalendar/>
            </ProtectedRoute>
          } 
        />

        {/* Eventos */}
        <Route 
          path="/eventos"
          element={
            <ProtectedRoute allowedRoles={perm}>
              <Eventos/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/criar-eventos"
          element={
            <ProtectedRoute allowedRoles={perm}>
              <CriarEventos/>
            </ProtectedRoute>
          }
        />
        
        {/* Meu Perfil */}
        <Route 
          path="/meuperfil" 
          element={
            <ProtectedRoute allowedRoles={perm}>
              <UserProfile/>
            </ProtectedRoute>
          }
        />

        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Usuarios/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/admin/comunidades" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ComunidadesAdmin/>
            </ProtectedRoute>
          }
        />

        {/* Rota de fallback (404) */}
        <Route path="*" element={<div>Página não encontrada (404)</div>} />
      </Routes>
    </AuthProvider>
    </>
  )
}

export default App