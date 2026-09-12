import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AccessRestricted } from "@/components/AccessRestricted";
import { Shell } from "@/components/Shell";
import { useAuth } from "@/lib/auth-context";
import { ApplicationDetail } from "@/pages/ApplicationDetail";
import { Applications } from "@/pages/Applications";
import { AuditTrail } from "@/pages/AuditTrail";
import { Dashboard } from "@/pages/Dashboard";
import { Exceptions } from "@/pages/Exceptions";
import { Login } from "@/pages/Login";
import { MlRiskModel } from "@/pages/MlRiskModel";
import { NewApplication } from "@/pages/NewApplication";
import { Rules } from "@/pages/Rules";
import { Simulator } from "@/pages/Simulator";
import type { Role } from "@/types";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, sessionExpired } = useAuth();
  const location = useLocation();
  if (!user) {
    return (
      <Navigate
        to={sessionExpired ? "/login?expired=1" : "/login"}
        replace
        state={{ from: location.pathname }}
      />
    );
  }
  return <>{children}</>;
}

function RequireRole({ allowedRoles, children }: { allowedRoles: Role[]; children: ReactNode }) {
  const { user, sessionExpired } = useAuth();
  if (!user) return <Navigate to={sessionExpired ? "/login?expired=1" : "/login"} replace />;
  if (!allowedRoles.includes(user.role)) {
    return <AccessRestricted allowedRoles={allowedRoles} />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Shell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route
          path="/applications/new"
          element={
            <RequireRole allowedRoles={["RM", "ADMIN"]}>
              <NewApplication />
            </RequireRole>
          }
        />
        <Route path="/applications/:id" element={<ApplicationDetail />} />
        <Route
          path="/exceptions"
          element={
            <RequireRole allowedRoles={["L1_APPROVER", "L2_APPROVER", "ADMIN"]}>
              <Exceptions />
            </RequireRole>
          }
        />
        <Route
          path="/rules"
          element={
            <RequireRole allowedRoles={["ADMIN"]}>
              <Rules />
            </RequireRole>
          }
        />
        <Route
          path="/ml-risk-model"
          element={
            <RequireRole allowedRoles={["ADMIN"]}>
              <MlRiskModel />
            </RequireRole>
          }
        />
        <Route
          path="/simulator"
          element={
            <RequireRole allowedRoles={["RM", "ADMIN"]}>
              <Simulator />
            </RequireRole>
          }
        />
        <Route path="/audit" element={<AuditTrail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
