import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet } from 'react-helmet';

import Accueil from './components/accueil';
import Menubar from './components/menubar';
import InfoMap from './components/infoMap';
import ConsoTable from './components/consoTable';
import Dashboard from './components/dashboard';
import BubbleCanvas from './components/BubbleCanvas';
import ErrorPage from './components/ErrorPage'; // Import the ErrorPage component
import Maintenance from './components/Maintenance'; // Import the Maintenance component
import MaintenanceCheck from './components/MaintenanceCheck'; // Import the MaintenanceCheck component
import './components/general.css';
import './components/accueil.css';

function App() {
  return (
    <>
      <Helmet>
        <link rel="icon" href="./../public/pictures/water_icon.png" type="image/png" />
        <title>EauClaire</title>
      </Helmet>
      <BrowserRouter>
        <BubbleCanvas /> {/* Ensure this covers the whole viewport */}
        <Routes>
          <Route path="/" element={<MaintenanceCheck />} />
          <Route path="/accueil" element={<><Menubar /><Accueil /></>} />
          <Route path="/infoMap" element={<><Menubar /><InfoMap /></>} />
          <Route path="/consoTable" element={<><Menubar /><ConsoTable /></>} />
          <Route path="/dashboard" element={<><Menubar /><Dashboard /></>} />
          <Route path="/maintenance" element={<><Maintenance /></>} /> {/* Maintenance page without Menubar */}
          {/* Catch-all route for 404 errors */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
