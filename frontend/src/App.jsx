import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import WrappedPage from "./WrappedPage";
import P5Background from "./P5Background";

function App() {
  const handleLogin = () => {
    window.location.href = "http://localhost:5001/auth/github";
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-[#08080a] flex items-center justify-center relative overflow-hidden">
              <P5Background />
              
              <div className="relative z-10 text-center">
                <h1 className="text-[120px] font-light text-white mb-12 tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 200 }}>
                  devboard
                </h1>
                
                <button
                  onClick={handleLogin}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-300 tracking-wide"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 300 }}
                >
                  connect with github →
                </button>
              </div>
            </div>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wrapped" element={<WrappedPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
