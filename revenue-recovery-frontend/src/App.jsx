import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import DashboardLayout from "./layout/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import RevenueRisks from "./pages/RevenueRisks";
import RiskDetails from "./pages/RiskDetails";
import RecoveryCenter from "./pages/RecoveryCenter";
import HumanReview from "./pages/HumanReview";
import AuditLogs from "./pages/AuditLogs";
import Login from "./pages/Login";

import ProtectedRoute from "./components/ProtectedRoute";

const router =
    createBrowserRouter([
      {
        path: "/login",
        element: <Login />,
      },

      {
        path: "/",

        element: (
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
        ),

        children: [
          {
            index: true,
            element: <Dashboard />,
          },

          {
            path: "risks",
            element: <RevenueRisks />,
          },

          {
            path: "risks/:id",
            element: <RiskDetails />,
          },

          {
            path: "recovery",
            element: <RecoveryCenter />,
          },

          {
            path: "human-review",
            element: <HumanReview />,
          },

          {
            path: "audit",
            element: <AuditLogs />,
          },
        ],
      },
    ]);

export default function App() {

  return (
      <RouterProvider
          router={router}
      />
  );
}