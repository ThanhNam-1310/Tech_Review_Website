// src/pages/admin/AdminRolesUsersPage.jsx

import { useEffect, useState } from "react";
import { RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";

import { GetAllRole } from "@/apis/roles.api";
import { GetAllUserAdmins } from "@/apis/user.api";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const normalizeRole = (r) => ({
  id: r.id ?? r.Id,
  name: r.name ?? r.Name ?? "",
  description: r.description ?? r.Description ?? "",
  permissions: r.permissions ?? r.Permissions ?? [],
});

const normalizeUser = (u) => ({
  id: u.id ?? u.Id,
  userName: u.userName ?? u.UserName ?? "",
  fullName: u.fullName ?? u.FullName ?? "",
  email: u.email ?? u.Email ?? "",
  avatarUrl: u.avatarUrl ?? u.AvatarUrl ?? "",
  roleId: u.roleId ?? u.RoleId ?? u.role?.id ?? u.Role?.Id ?? null,
  roleName: u.roleName ?? u.RoleName ?? u.role?.name ?? u.Role?.Name ?? null,
});

const initials = (user) => {
  const name = user.fullName || user.userName || "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const AdminRolesUsersPage = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [roleRes, userRes] = await Promise.all([
        GetAllRole(),
        GetAllUserAdmins(),
      ]);

      const rawRoles = roleRes.data?.data ?? roleRes.data ?? [];
      setRoles((Array.isArray(rawRoles) ? rawRoles : []).map(normalizeRole));

      const rawUsers =
        userRes.data?.items ?? userRes.data?.data ?? userRes.data ?? [];
      setUsers((Array.isArray(rawUsers) ? rawUsers : []).map(normalizeUser));
    } catch {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      setRoles([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const roleNameById = (roleId) =>
    roles.find((r) => r.id === roleId)?.name ?? null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Role & Người dùng</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      {error && (
        <div className="flex flex-col items-center gap-2 rounded-md border border-destructive/30 py-8">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData}>
            Thử lại
          </Button>
        </div>
      )}

      {/* ===== Bảng Roles ===== */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="size-5" />
          <h2 className="text-lg font-semibold">Danh sách vai trò:</h2>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên vai trò</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="w-32 text-center">
                  Số permission
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    Chưa có vai trò.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Badge variant="secondary">{role.name}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {role.permissions?.length ?? 0}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ===== Bảng Users (chỉ admin) ===== */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Danh sách tài khoản quản trị viên
        </h2>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Avatar</TableHead>
                <TableHead>Tên đăng nhập</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò hiện tại</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Chưa có tài khoản quản trị viên.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const displayRole =
                    user.roleName || roleNameById(user.roleId) || null;

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Avatar className="size-9">
                          <AvatarImage
                            src={user.avatarUrl || undefined}
                            alt={user.userName}
                          />
                          <AvatarFallback>{initials(user)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.userName || "—"}
                      </TableCell>
                      <TableCell>{user.fullName || "—"}</TableCell>
                      <TableCell>{user.email || "—"}</TableCell>
                      <TableCell>
                        {displayRole ? (
                          <Badge>{displayRole}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default AdminRolesUsersPage;
