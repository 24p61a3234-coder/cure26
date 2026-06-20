import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import Login from './pages/Login.jsx';
import WaitingRoom from './pages/WaitingRoom.jsx';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/doctor', element: <DoctorDashboard /> }
        ]
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/waiting-room', element: <WaitingRoom /> }]
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> }
]);
