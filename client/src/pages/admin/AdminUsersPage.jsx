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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9 pr-9"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setPage(1);
                setActiveSearch("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button onClick={handleSearch}>Tìm kiếm</Button>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchUsers}
          disabled={loading}
          title="Làm mới"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-md border">
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-14">Avatar</TableHead>
                <TableHead>Tên đăng nhập</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    {activeSearch
                      ? `Không tìm thấy "${activeSearch}".`
                      : emptyText}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
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
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Sửa"
                          onClick={() => onEdit(user)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xóa"
                          onClick={() => onDelete(user)}
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
        <p className="text-sm text-muted-foreground">
          Hiển thị {start}–{end} trên tổng {totalCount} tài khoản
        </p>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
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
                  page === totalPages ? "pointer-events-none opacity-50" : ""
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
      <h1 className="shrink-0 text-2xl font-bold">Quản lý người dùng</h1>

      <Tabs defaultValue="normal" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="w-fit shrink-0">
          <TabsTrigger value="normal">
            <Users className="mr-2 size-4" />
            Người dùng
          </TabsTrigger>
          <TabsTrigger value="expert">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa người dùng "
              {deleting?.fullName || deleting?.userName}"? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingLoading}>
              Hủy
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingLoading}
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
