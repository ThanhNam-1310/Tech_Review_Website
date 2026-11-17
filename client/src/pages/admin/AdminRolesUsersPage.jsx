// src/pages/admin/AdminRolesUsersPage.jsx

import { useEffect, useState } from "react";
import { RefreshCw, Shield, Users } from "lucide-react";
import { toast } from "sonner";

import { GetAllRole } from "@/apis/roles.api";
import {
  GetAllUserAdmins,
  GetAllUserExperts,
  GetAllUserNormals,
} from "@/apis/user.api";

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

// Số tài khoản: ưu tiên totalCount của envelope phân trang, không thì đếm mảng.
const countOf = (res) => {
  const data = res?.data ?? {};
  if (typeof data.totalCount === "number") return data.totalCount;
  const arr = data.items ?? data.data ?? data;
  return Array.isArray(arr) ? arr.length : 0;
};

// Màu đặc tương phản mạnh, mỗi vai trò một màu riêng, chữ trắng
const ROLE_BADGE_STYLES = {
  user: "bg-blue-600 text-white shadow-sm hover:bg-blue-600",
  expert: "bg-violet-600 text-white shadow-sm hover:bg-violet-600",
  admin: "bg-rose-600 text-white shadow-sm hover:bg-rose-600",
};
const roleBadgeClass = (name) =>
  ROLE_BADGE_STYLES[(name || "").toLowerCase()] ??
  "bg-teal-600 text-white shadow-sm hover:bg-teal-600";

const headClass =
  "bg-sky-50/60 text-xs font-semibold uppercase tracking-wider text-slate-500";

const AdminRolesUsersPage = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [accountCounts, setAccountCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [roleRes, userRes, normalRes, expertRes] = await Promise.all([
        GetAllRole(),
        GetAllUserAdmins(),
        GetAllUserNormals({ pageNumber: 1, pageSize: 1 }),
        GetAllUserExperts({ pageNumber: 1, pageSize: 1 }),
      ]);

      const rawRoles = roleRes.data?.data ?? roleRes.data ?? [];
      setRoles((Array.isArray(rawRoles) ? rawRoles : []).map(normalizeRole));

      const rawUsers =
        userRes.data?.items ?? userRes.data?.data ?? userRes.data ?? [];
      setUsers((Array.isArray(rawUsers) ? rawUsers : []).map(normalizeUser));

      setAccountCounts({
        user: countOf(normalRes),
        expert: countOf(expertRes),
        admin: countOf(userRes),
      });
    } catch {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      setRoles([]);
      setUsers([]);
      setAccountCounts({});
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
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-sm shadow-sky-500/25">
            <Shield className="size-5" />
          </span>
          <h1 className="text-2xl font-bold">Role & Người dùng</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-700"
        >
          <RefreshCw
            className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      {error && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/60 py-8">
          <p className="text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="rounded-xl"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* ===== Bảng Roles ===== */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-sm shadow-sky-500/25">
            <Shield className="size-4" />
          </span>
          <h2 className="text-lg font-semibold">Danh sách vai trò:</h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={headClass}>Tên vai trò</TableHead>
                <TableHead className={headClass}>Mô tả</TableHead>
                <TableHead className={`w-32 text-center ${headClass}`}>
                  Số tài khoản
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-10 text-center text-slate-500"
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-10 text-center text-slate-500"
                  >
                    Chưa có vai trò.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-sky-50/50">
                    <TableCell>
                      <Badge className={roleBadgeClass(role.name)}>
                        {role.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {role.description || "—"}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {accountCounts[(role.name || "").toLowerCase()] ?? 0}
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
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-sm shadow-sky-500/25">
            <Users className="size-4" />
          </span>
          <h2 className="text-lg font-semibold">
            Danh sách tài khoản quản trị viên
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={`w-14 ${headClass}`}>Avatar</TableHead>
                <TableHead className={headClass}>Tên đăng nhập</TableHead>
                <TableHead className={headClass}>Họ tên</TableHead>
                <TableHead className={headClass}>Email</TableHead>
                <TableHead className={headClass}>Vai trò hiện tại</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-slate-500"
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-slate-500"
                  >
                    Chưa có tài khoản quản trị viên.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const displayRole =
                    user.roleName || roleNameById(user.roleId) || null;

                  return (
                    <TableRow key={user.id} className="hover:bg-sky-50/50">
                      <TableCell>
                        <Avatar className="size-9 ring-2 ring-sky-100">
                          <AvatarImage
                            src={user.avatarUrl || undefined}
                            alt={user.userName}
                          />
                          <AvatarFallback className="bg-sky-100 text-xs font-semibold text-sky-700">
                            {initials(user)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.userName || "—"}
                      </TableCell>
                      <TableCell>{user.fullName || "—"}</TableCell>
                      <TableCell className="text-slate-500">
                        {user.email || "—"}
                      </TableCell>
                      <TableCell>
                        {displayRole ? (
                          <Badge className={roleBadgeClass(displayRole)}>
                            {displayRole}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
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
