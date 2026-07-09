import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Splash from "./components/Splash/Splash";

import LoginPage from "./pages/LoginPage";
import LoadingPage from "./pages/LoadingPage";
import HomePage from "./pages/HomePage";
import ResultsPage from "./pages/ResultsPage";
import OrderPage from "./pages/OrderPage";

const basename = process.env.PUBLIC_URL || "/SurtialimentosWeb";

function App() {
  const [entered, setEntered] = React.useState(false);

  return (
    <Router basename={basename}>
      {!entered ? (
        <Splash onEnter={() => setEntered(true)} />
      ) : (
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/loading" element={<LoadingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/order" element={<OrderPage />} />
          </Routes>
        </div>
      )}
    </Router>
  );
}

export default App;
