import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import ProtectedLayout from './components/layout/ProtectedLayout';
import Login from './pages/Login';

import Employees from './pages/Employees';
import ScanAttendance from './pages/ScanAttendance';
import AttendanceLog from './pages/AttendanceLog';
import './index.css';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan" element={<ScanAttendance />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/logs" element={<AttendanceLog />} />
          </Route>
          {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}