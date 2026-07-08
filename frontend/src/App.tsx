/*
 * App.tsx — raiz da aplicação
 *
 * Conceitos cobertos aqui:
 *  - BrowserRouter   → habilita o roteamento baseado na URL do navegador
 *  - Routes          → container que olha a URL e renderiza o Route correto
 *  - Route           → mapeia um path (ex: "/login") para um componente
 *  - Navigate        → redireciona automaticamente (ex: "/" → "/login")
 *
 * Como funciona:
 *  Quando o usuário acessa /login, o React Router encontra o <Route path="/login">
 *  e renderiza o <LoginPage> no lugar do <Routes>.
 *  Os outros componentes da árvore (fora de <Routes>) continuam renderizando normalmente.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeToggle } from './components/ThemeToggle'
import { ProtectedRoute } from './components/ProtectedRoute'

// Auth
import { LoginPage } from './pages/Auth/Login'
import { ForgotPasswordPage } from './pages/Auth/ForgotPassword'
import { ActivatePage } from './pages/Auth/Activate'

// Área logada (stubs por enquanto)
import { DashboardPage } from './pages/Dashboard'
import { InventarioPage } from './pages/Inventario'
import { InventarioFuncionariosPage } from './pages/Inventario/Funcionarios'
import { RHPage } from './pages/RH'
import { RHCamposPage } from './pages/RH/Campos'
import { RHCandidatoPage } from './pages/RH/Candidato'
import { FormularioPage } from './pages/Formulario'
import { ContatosPage } from './pages/Contatos'
import { ConfiguracoesPage } from './pages/Configuracoes'
import { TicketsPage } from './pages/Tickets'
import TicketDetail from './pages/Tickets/TicketDetail/TicketDetail'
import { Logs } from './pages/Logs'
import { AjudaPage } from './pages/Ajuda'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeToggle />
      <Routes>

        {/* Redireciona a raiz para /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ── Páginas de autenticação (sem header) ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/activate" element={<ActivatePage />} />

        {/* ── Área logada — qualquer usuário autenticado ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/inventario/funcionarios" element={<InventarioFuncionariosPage />} />
          <Route path="/contatos" element={<ContatosPage />} />
          <Route path="/ajuda" element={<AjudaPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/ticketDetail/:id" element={<TicketDetail />} />
        </Route>

        {/* ── Área logada — ADMIN e RH ── */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'RH']} />}>
          <Route path="/rh" element={<RHPage />} />
          <Route path="/rh/campos" element={<RHCamposPage />} />
          <Route path="/rh/:id" element={<RHCandidatoPage />} />
        </Route>

        {/* ── Área logada — somente ADMIN ── */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
          <Route path="/logs" element={<Logs />} />
        </Route>

        {/* ── Formulário público (sem auth) ── */}
        <Route path="/formulario/:token" element={<FormularioPage />} />

      </Routes>
    </BrowserRouter>
  )
}
