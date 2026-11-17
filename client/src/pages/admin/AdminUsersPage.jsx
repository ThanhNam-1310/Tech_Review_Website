import { useCallback, useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  X,
  Users,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

import {
  GetAllUserNormals,
  GetAllUserExperts,
  UpdateUser,
  DeleteUser,
} from "@/apis/user.api";
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
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserFormDialog from "@/components/forms/UserFormDialog";

const PAGE_SIZE = 10;

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

// ===== 1 tab danh sách user (dùng chung cho normal + expert) =====
const UserTab = ({ fetcher, tick, emptyText, onEdit, onDelete }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const start = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalCount);

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
                <TableHead className={`text-right ${headClass}`}>
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-slate-500"
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
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
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Sửa"
                          onClick={() => onEdit(user)}
                          className="rounded-xl hover:bg-violet-50 hover:text-violet-700"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xóa"
                          onClick={() => onDelete(user)}
                          className="rounded-xl hover:bg-rose-50"
                        >
                          <Trash2 className="size-4 text-destructive" />
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

// ===== Page chính =====
const AdminUsersPage = () => {
  const [tick, setTick] = useState(0); // tăng để cả 2 tab tải lại sau khi sửa/xoá
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const refresh = () => setTick((t) => t + 1);

  const handleFormSubmit = async (payload) => {
    try {
      await UpdateUser(editing.id, payload);
      toast.success("Cập nhật người dùng thành công");
      refresh();
    } catch {
      toast.error("Cập nhật thất bại");
      throw new Error("submit failed");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await DeleteUser(deleting.id);
      toast.success(`Đã xóa "${deleting.fullName || deleting.userName}"`);
      setDeleting(null);
      refresh();
    } catch {
      toast.error("Xóa người dùng thất bại");
    } finally {
      setDeletingLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-0 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm shadow-violet-500/25">
          <Users className="size-5" />
        </span>
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
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
        </TabsList>

        <TabsContent
          value="normal"
          className="mt-4 flex min-h-0 flex-1 flex-col"
        >
          <UserTab
            fetcher={GetAllUserNormals}
            tick={tick}
            emptyText="Chưa có người dùng."
            onEdit={(u) => {
              setEditing(u);
              setFormOpen(true);
            }}
            onDelete={setDeleting}
          />
        </TabsContent>

        <TabsContent
          value="expert"
          className="mt-4 flex min-h-0 flex-1 flex-col"
        >
          <UserTab
            fetcher={GetAllUserExperts}
            tick={tick}
            emptyText="Chưa có chuyên gia."
            onEdit={(u) => {
              setEditing(u);
              setFormOpen(true);
            }}
            onDelete={setDeleting}
          />
        </TabsContent>
      </Tabs>

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editing}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa người dùng "
              {deleting?.fullName || deleting?.userName}"? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deletingLoading}
              className="rounded-xl"
            >
              Hủy
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingLoading}
              className="rounded-xl"
            >
              {deletingLoading ? "Đang xóa..." : "Xóa"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsersPage;
