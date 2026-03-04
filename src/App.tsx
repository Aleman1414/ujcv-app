
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Classrooms } from './pages/admin/Classrooms';
import { Teachers } from './pages/admin/Teachers';
import { Schedules } from './pages/admin/Schedules';
import { MySchedule } from './pages/teacher/MySchedule';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes directly rendering MainLayout */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            {/* Accessible by all authenticated users */}
            <Route path="/" element={<Dashboard />} />

            {/* Admin Only Routes */}
            <Route
              path="/admin/classrooms"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Classrooms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Teachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schedules"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Schedules />
                </ProtectedRoute>
              }
            />

            {/* Teacher Only Routes (Admin can also view them if needed, but let's restrict to docente for now) */}
            <Route
              path="/teacher/schedule"
              element={
                <ProtectedRoute allowedRoles={['docente', 'admin']}>
                  <MySchedule />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
