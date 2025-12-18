import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Upload } from "./pages/Upload";
import { ReportDetail } from "./pages/ReportDetail";
import { Chat } from "./pages/Chat";
import { DoctorPanel } from "./pages/DoctorPanel";

import Snowfall from "react-snowfall";
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen premium-bg">
          <Snowfall
            color="#82C3D9"
            snowflakeCount={150}
            speed={[0.5, 4.0]}
            wind={[-0.5, 2.0]}
          />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/:id"
              element={
                <ProtectedRoute>
                  <ReportDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor-panel"
              element={
                <ProtectedRoute allowedRoles={["doctor", "admin"]}>
                  <DoctorPanel />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
