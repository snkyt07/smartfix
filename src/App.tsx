// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Flow from './pages/Flow';
import Result from './pages/Result';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/flow" element={<Flow />} />
      <Route path="/result" element={<Result />} />
    </Routes>
  );
}
