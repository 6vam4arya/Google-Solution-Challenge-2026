import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Triage from './pages/Triage';
import BFTSimulator from './pages/BFTSimulator';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/triage" element={<Triage />} />
          <Route path="/simulator" element={<BFTSimulator />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;