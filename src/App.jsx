
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import OnePage from './pages/OnePage';
import Register from './pages/Register';
import UserRecovery from './pages/UserRecovery';
import Login from './pages/Login';
import ClienteReserva from './components/ClienteReserva';
import ReservaWeb from './pages/ReservaWeb';

function App() {
  return (
    <>
      <Header />
      <Routes>
  <Route path="/" element={<OnePage />} />
  <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/UserRecovery" element={<UserRecovery />} />
  <Route path="/reserva-cliente" element={<ClienteReserva />} />
  <Route path="/ReservaWeb" element={<ReservaWeb />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
