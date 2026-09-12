import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";

import { Button, PageHeader } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/types";

export function AccessRestricted({ allowedRoles }: { allowedRoles: Role[] }) {
  const { user } = useAuth();

  const userRoleLabel = user?.role.replace(/_/g, " ") || "UNKNOWN";
  const requiredRolesList = allowedRoles.map((r) => r.replace(/_/g, " ")).join(", ");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Restricted — 403 Forbidden"
        subtitle="Role-Based Access Control (RBAC) Enforcement"
      />

      <div className="rounded-xl border border-red-200 bg-red-50/60 p-8 text-center max-w-2xl mx-auto shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700 mb-4">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">Insufficient Role Authorization</h3>

        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          Your current authenticated session role is <strong className="font-semibold text-slate-900">{userRoleLabel}</strong>. This operational section requires authorized institutional clearance: <strong className="font-semibold text-slate-900">{requiredRolesList}</strong>.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" size="sm" className="bg-slate-900 hover:bg-slate-800">
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Dashboard
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="sm">
              Switch User Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
