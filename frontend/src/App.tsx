import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route } from "react-router-dom";
import useSocket from "./hooks/useSocket";
import { logout } from "./features/auth/authSlice";
import type { AppDispatch } from "./app/store";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import InterviewRunner from "./pages/InterviewRunner";
import SessionReview from "./pages/SessionReview";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";

import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  useSocket();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleUnauthorized = () => {
      toast.dismiss();
      dispatch(logout());
    };
    window.addEventListener("auth_unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth_unauthorized", handleUnauthorized);
  }, [dispatch]);

  return (
    <>
      <div className="relative min-h-screen bg-slate-50 text-slate-700 overflow-x-hidden">
        {/* Soft decorative light background elements */}
        <div className="bg-glow w-125 h-125 bg-teal-200/50 -top-48 -left-48 opacity-60"></div>
        <div className="bg-glow w-100 h-100 bg-indigo-200/50 bottom-0 -right-24 opacity-60"></div>

        <ToastContainer
          position="top-right"
          autoClose={1800}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Header />
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-full"
            >
              <Routes location={location} key={location.pathname}>
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                <Route path="/" element={<PrivateRoute />} >
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route path="/interview/:sessionId" element={<InterviewRunner />} />
                  <Route path="/review/:sessionId" element={<SessionReview />} />
                </Route>

                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  )
}

export default App
