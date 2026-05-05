import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";

export const Route = createFileRoute("/admin")({
  component: AdminRootLayout,
});

function AdminRootLayout() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}
