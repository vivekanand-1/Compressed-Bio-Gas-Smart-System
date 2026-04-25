import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Optimization from './pages/Optimization';
import Analytics from './pages/Analytics';
import Suppliers from './pages/Suppliers';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SmartRoutePlanner from './pages/SmartRoutePlanner';

// Simple Auth Wrapper
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected System Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="optimize" element={<Optimization />} />
            <Route path="smart-planner" element={<SmartRoutePlanner />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="suppliers" element={<Suppliers />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
