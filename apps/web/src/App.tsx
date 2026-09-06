import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './app/AppShell';
import { Checkout } from './pages/Checkout';
import { ConfirmEmail } from './pages/ConfirmEmail';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { SalesPage } from './pages/SalesPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/trial" replace />} />
      <Route path="/trial" element={<Landing />} />
      <Route path="/activate" element={<SalesPage />} />
      <Route path="/secure-checkout" element={<Checkout />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app/confirm-email" element={<ConfirmEmail />} />
      <Route path="/app/*" element={<AppShell />} />
      <Route path="*" element={<Navigate to="/trial" replace />} />
    </Routes>
  );
}
