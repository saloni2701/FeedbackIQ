import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Overview from './pages/Overview';
import Feedback from './pages/Feedback';
import Topics from './pages/Topics';
import Issues from './pages/Issues';
import Requests from './pages/Requests';
import Trends from './pages/Trends';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="topics" element={<Topics />} />
          <Route path="issues" element={<Issues />} />
          <Route path="requests" element={<Requests />} />
          <Route path="trends" element={<Trends />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
