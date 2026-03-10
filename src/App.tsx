import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AgentLayout from "@/components/layout/AgentLayout";
import DashboardPage from "@/pages/agent/DashboardPage";
import OrdersPage from "@/pages/agent/OrdersPage";
import ActiveDeliveryPage from "@/pages/agent/ActiveDeliveryPage";
import CompleteDeliveryPage from "@/pages/agent/CompleteDeliveryPage";
import EarningsPage from "@/pages/agent/EarningsPage";
import ProfilePage from "@/pages/agent/ProfilePage";
import NotificationsPage from "@/pages/agent/NotificationsPage";
import ReceiptPage from "@/pages/agent/ReceiptPage";
import NewOrderPage from "@/pages/agent/NewOrderPage";
import DeliveryHistoryPage from "@/pages/agent/DeliveryHistoryPage";
import LoginPage from "@/pages/auth/LoginPage";
import InstallPage from "@/pages/InstallPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/agent/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/agent/dashboard" replace />} />
            <Route path="/install" element={<InstallPage />} />
            <Route path="/auth/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/auth/signup" element={<Navigate to="/auth/login" replace />} />
            <Route
              path="/agent"
              element={
                <ProtectedRoute>
                  <AgentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="active-delivery" element={<ActiveDeliveryPage />} />
              <Route path="complete-delivery" element={<CompleteDeliveryPage />} />
              <Route path="earnings" element={<EarningsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="receipt/:orderId" element={<ReceiptPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
