import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowRightLeft,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  GetAllUserAdmins,
  GetAllUserExperts,
  GetAllUserNormals,
} from "@/apis/user.api";
import { GetAllRole, SetRoleUser } from "@/apis/roles.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 10;

const ROLE_LABELS = {
  user: "Người dùng thường",
  expert: "Chuyên gia",
  admin: "Quản trị viên",
};
const roleLabel = (name) =>
  ROLE_LABELS[(name || "").toLowerCase()] ?? name ?? "Chưa rõ";

// Badge màu role giữ hệ màu mạnh đã chốt chung cho cả khu admin
const ROLE_BADGE_STYLES = {
  user: "bg-blue-600 text-white shadow-sm hover:bg-blue-600",
  expert: "bg-violet-600 text-white shadow-sm hover:bg-violet-600",
  admin: "bg-rose-600 text-white shadow-sm hover:bg-rose-600",
};
const roleBadgeClass = (name) =>
  ROLE_BADGE_STYLES[(name || "").toLowerCase()] ??
  "bg-zinc-500 text-white shadow-sm hover:bg-zinc-500";

// Tab nào thì tài khoản trong tab đó đang mang role đó
const TAB_ROLES = {
  normal: "user",
  expert: "expert",
  admin: "admin",
};

const normalizeUser = (u) => ({
  id: u.id ?? u.Id,
  userName: u.userName ?? u.UserName ?? "",
  fullName: u.fullName ?? u.FullName ?? "",
  email: u.email ?? u.Email ?? "",
  avatarUrl: u.avatarUrl ?? u.AvatarUrl ?? "",
  roleName: u.roleName ?? u.RoleName ?? "",
});

const initials = (user) =>
  (user.fullName || user.userName || "?")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const headClass =
  "text-xs font-semibold uppercase tracking-wider text-slate-500";

// ===== 1 tab danh sách user (dùng chung cho cả 3 nhóm) =====
const UserTab = ({ fetcher, tabKey, tick, emptyText, onChangeRole }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const start = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalCount);
  const tabRole = TAB_ROLES[tabKey];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetcher({
        search: activeSearch || undefined,
        pageNumber: page,
        pageSize: PAGE_SIZE,
      });
      const data = res.data ?? {};
      const items = (
        Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []
      ).map(normalizeUser);
      setTotalCount(data.totalCount ?? items.length);
      // BE trả mảng thuần (không phân trang) thì tự cắt trang ở client
      setUsers(
        items.length > PAGE_SIZE
          ? items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
          : items,
      );
    } catch {
      toast.error("Không thể tải danh sách người dùng.");
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [fetcher, page, activeSearch, tick]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setPage(1);
    setActiveSearch(searchInput.trim());
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
          <Input
            placeholder="Tìm theo tên, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9 pr-9 rounded-xl border-violet-100 bg-white focus-visible:border-violet-300 focus-visible:ring-violet-400"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setPage(1);
                setActiveSearch("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-violet-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          onClick={handleSearch}
          className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-white shadow-md shadow-violet-500/25 hover:from-violet-600 hover:to-fuchsia-600"
        >
          Tìm kiếm
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchUsers}
          disabled={loading}
          title="Làm mới"
          className="rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-700"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-violet-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className={`w-14 ${headClass}`}>Avatar</TableHead>
                <TableHead className={headClass}>Tên đăng nhập</TableHead>
                <TableHead className={headClass}>Họ tên</TableHead>
                <TableHead className={headClass}>Email</TableHead>
                <TableHead className={headClass}>Vai trò hiện tại</TableHead>
                <TableHead className={`text-right ${headClass}`}>
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-slate-500"
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-slate-500"
                  >
                    {activeSearch
                      ? `Không tìm thấy "${activeSearch}".`
                      : emptyText}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-violet-50/50">
                    <TableCell>
                      <Avatar className="size-9 ring-2 ring-violet-100">
                        <AvatarImage
                          src={user.avatarUrl || undefined}
                          alt={user.userName}
                        />
                        <AvatarFallback className="bg-violet-100 text-xs font-semibold text-violet-700">
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
                      <Badge className={roleBadgeClass(tabRole)}>
                        {roleLabel(tabRole)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onChangeRole(user)}
                          className="rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-700"
                        >
                          <ArrowRightLeft className="mr-1.5 size-3.5" />
                          Đổi vai trò
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center justify-between gap-2 sm:flex-row">
        <p className="text-sm text-slate-500">
          Hiển thị {start}–{end} trên tổng {totalCount} tài khoản
        </p>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={page === 1}
                className={
                  page === 1
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-violet-50 hover:text-violet-700"
                }
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="flex h-9 items-center px-3 text-sm font-medium">
                {page}/{totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={page === totalPages}
                className={
                  page === totalPages
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-violet-50 hover:text-violet-700"
                }
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

// ===== Dialog đổi vai trò =====
const RoleChangeDialog = ({
  open,
  onOpenChange,
  user,
  currentRoleName,
  roles,
  onSubmit,
}) => {
  const [selectedId, setSelectedId] = useState("");
  const [saving, setSaving] = useState(false);

  const currentRole =
    roles.find(
      (r) =>
        (r.name || "").toLowerCase() === (currentRoleName || "").toLowerCase(),
    ) ?? null;
  // Chưa chọn gì thì mặc định là vai trò hiện tại (kể cả khi roles tải về sau)
  const effectiveId = selectedId || (currentRole ? String(currentRole.id) : "");
  const selectedRole = roles.find((r) => String(r.id) === effectiveId) ?? null;
  const changed =
    !!selectedRole &&
    (!currentRole || String(selectedRole.id) !== String(currentRole.id));

  useEffect(() => {
    setSelectedId("");
  }, [user?.id]);

  useEffect(() => {
    if (open) setSaving(false);
  }, [open]);

  const handleSave = async () => {
    if (!user || !selectedRole || !changed) return;
    setSaving(true);
    try {
      await onSubmit(user, selectedRole);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm shadow-violet-500/25">
              <ArrowRightLeft className="size-4" />
            </span>
            Đổi vai trò
          </DialogTitle>
        </DialogHeader>

        {user && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2.5">
              <Avatar className="size-10 ring-2 ring-violet-100">
                <AvatarImage
                  src={user.avatarUrl || undefined}
                  alt={user.userName}
                />
                <AvatarFallback className="bg-violet-100 text-xs font-semibold text-violet-700">
                  {initials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {user.fullName || user.userName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  @{user.userName}
                  {user.email ? ` · ${user.email}` : ""}
                </p>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 transition-colors ${
                changed ? "border-violet-200 bg-violet-50" : "border-zinc-200"
              }`}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-xs text-slate-500">Vai trò hiện tại</span>
                <Badge className={`${roleBadgeClass(currentRoleName)} w-fit`}>
                  {roleLabel(currentRoleName)}
                </Badge>
              </div>
              <ArrowRight className="size-4 shrink-0 text-slate-400" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-xs text-slate-500">Vai trò mới</span>
                <Select
                  value={effectiveId}
                  onValueChange={setSelectedId}
                  disabled={roles.length === 0}
                >
                  <SelectTrigger className="rounded-xl border-violet-100 bg-white focus:ring-violet-400">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={4}
                  >
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {roleLabel(r.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {changed && (
              <p className="text-xs text-violet-700">
                Sẽ đổi khi lưu. Tài khoản sẽ chuyển sang tab của vai trò mới.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={!changed || saving}
            className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-white shadow-md shadow-violet-500/25 hover:from-violet-600 hover:to-fuchsia-600"
          >
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Đổi vai trò
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ===== Page chính =====
const AdminRoleAssignmentPage = () => {
  const [roles, setRoles] = useState([]);
  const [tick, setTick] = useState(0); // tăng để các tab tải lại sau khi đổi role
  const [changing, setChanging] = useState(null); // { user, currentRoleName }

  useEffect(() => {
    GetAllRole()
      .then((res) => {
        const raw = res.data?.data ?? res.data ?? [];
        setRoles(
          (Array.isArray(raw) ? raw : []).map((r) => ({
            id: r.id ?? r.Id,
            name: r.name ?? r.Name ?? "",
          })),
        );
      })
      .catch(() => toast.error("Không tải được danh sách vai trò."));
  }, []);

  const handleRoleSubmit = async (user, newRole) => {
    try {
      await SetRoleUser(user.id, newRole.id);
      toast.success(
        `Đã chuyển "${user.fullName || user.userName}" sang vai trò ${roleLabel(newRole.name)}`,
      );
      setChanging(null);
      setTick((t) => t + 1);
    } catch {
      toast.error("Đổi vai trò thất bại");
    }
  };

  const openChangeDialog = (tabKey) => (user) =>
    setChanging({ user, currentRoleName: TAB_ROLES[tabKey] });

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-0 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm shadow-violet-500/25">
          <ArrowRightLeft className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-tight">
            Chuyển đổi vai trò
          </h1>
          <p className="text-sm text-slate-500">
            Chuyển tài khoản sang vai trò khác. Tài khoản sẽ chuyển sang tab của
            vai trò mới sau khi đổi.
          </p>
        </div>
      </div>

      <Tabs defaultValue="normal" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="w-fit shrink-0 bg-violet-50">
          <TabsTrigger
            value="normal"
            className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"
          >
            <Users className="mr-2 size-4" />
            Người dùng
          </TabsTrigger>
          <TabsTrigger
            value="expert"
            className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"
          >
            <GraduationCap className="mr-2 size-4" />
            Chuyên gia
          </TabsTrigger>
          <TabsTrigger
            value="admin"
            className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700"
          >
            <Shield className="mr-2 size-4" />
            Quản trị viên
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="normal"
          className="mt-4 flex min-h-0 flex-1 flex-col"
        >
          <UserTab
            fetcher={GetAllUserNormals}
            tabKey="normal"
            tick={tick}
            emptyText="Chưa có người dùng."
            onChangeRole={openChangeDialog("normal")}
          />
        </TabsContent>

        <TabsContent
          value="expert"
          className="mt-4 flex min-h-0 flex-1 flex-col"
        >
          <UserTab
            fetcher={GetAllUserExperts}
            tabKey="expert"
            tick={tick}
            emptyText="Chưa có chuyên gia."
            onChangeRole={openChangeDialog("expert")}
          />
        </TabsContent>

        <TabsContent
          value="admin"
          className="mt-4 flex min-h-0 flex-1 flex-col"
        >
          <UserTab
            fetcher={GetAllUserAdmins}
            tabKey="admin"
            tick={tick}
            emptyText="Chưa có quản trị viên."
            onChangeRole={openChangeDialog("admin")}
          />
        </TabsContent>
      </Tabs>

      <RoleChangeDialog
        open={!!changing}
        onOpenChange={(o) => !o && setChanging(null)}
        user={changing?.user}
        currentRoleName={changing?.currentRoleName}
        roles={roles}
        onSubmit={handleRoleSubmit}
      />
    </div>
  );
};

export default AdminRoleAssignmentPage;
