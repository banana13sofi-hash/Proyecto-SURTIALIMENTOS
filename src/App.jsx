import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import LoadingPage from "./pages/LoadingPage";
import HomePage from "./pages/HomePage";
import ResultsPage from "./pages/ResultsPage";
import OrderPage from "./pages/OrderPage";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/loading" element={<LoadingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;