import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage        from './pages/LoginPage';
import AdminDashboard   from './pages/AdminDashboard';
import AttendancePage   from './pages/AttendancePage';
import ResultsPage      from './pages/ResultsPage';
import NoticesPage      from './pages/NoticesPage';
import FeesPage         from './pages/FeesPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentAttendance from './pages/StudentAttendance';
import StudentResults   from './pages/StudentResults';

import './styles/global.css';

// Wrap a page with the sidebar Layout + role protection
function AdminPage({ children }) {
  return (
    <ProtectedRoute role="admin">
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function StudentPage({ children }) {
  return (
    <ProtectedRoute role="student">
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>

      {/* ── Public ─────────────────────────────── */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
            : <LoginPage />
        }
      />

      {/* ── Admin routes ───────────────────────── */}
      <Route path="/admin" element={
        <AdminPage><AdminDashboard /></AdminPage>
      } />
      <Route path="/admin/attendance" element={
        <AdminPage><AttendancePage /></AdminPage>
      } />
      <Route path="/admin/results" element={
        <AdminPage><ResultsPage /></AdminPage>
      } />
      <Route path="/admin/notices" element={
        <AdminPage><NoticesPage /></AdminPage>
      } />
      <Route path="/admin/fees" element={
        <AdminPage><FeesPage /></AdminPage>
      } />

      {/* ── Student routes ─────────────────────── */}
      <Route path="/student" element={
        <StudentPage><StudentDashboard /></StudentPage>
      } />
      <Route path="/student/attendance" element={
        <StudentPage><StudentAttendance /></StudentPage>
      } />
      <Route path="/student/results" element={
        <StudentPage><StudentResults /></StudentPage>
      } />
      <Route path="/student/notices" element={
        <StudentPage><NoticesPage /></StudentPage>
      } />
      <Route path="/student/fees" element={
        <StudentPage><FeesPage /></StudentPage>
      } />

      {/* ── Fallback ───────────────────────────── */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
