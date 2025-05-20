import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Results from './Pages/Results';
import Analyzing from "./Pages/Analyzing";

import './index.css';
import { ImageProvider } from './Context/ImageContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ImageProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/analyzing" element={<Analyzing />} />

      </Routes>
    </ImageProvider>
  </BrowserRouter>
);
