import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReportes from "./pages/admin/ReportesAsistencia";
import ProfesorDashboard from "./pages/profesor/ProfesorDashboard";
import ProfesorReportes from "./pages/profesor/ReportesAsistencia";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reportes"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReportes />
                </ProtectedRoute>
              }
            />
            
            {/* Profesor Routes */}
            <Route
              path="/profesor"
              element={
                <ProtectedRoute allowedRoles={['profesor']}>
                  <ProfesorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profesor/reportes"
              element={
                <ProtectedRoute allowedRoles={['profesor']}>
                  <ProfesorReportes />
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
