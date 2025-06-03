import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Results from './Pages/Results';
import Analyzing from "./Pages/Analyzing";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";

import './index.css';
import { ImageProvider } from './Context/ImageContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ImageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/analyzing" element={<Analyzing />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ImageProvider>
  </BrowserRouter>
);
