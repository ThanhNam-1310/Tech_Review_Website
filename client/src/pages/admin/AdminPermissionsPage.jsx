import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  FileText,
  Package,
  LayoutGrid,
  MessageSquare,
  Users,
  Shield,
  KeyRound,
  CircleCheck,
} from "lucide-react";
import { GetAllRole } from "@/apis/roles.api";
import { GetPermissionForRole } from "@/apis/permission.api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ROLE_LABELS = {
  user: "Người dùng thường",
  expert: "Chuyên gia",
  admin: "Quản trị viên",
};
const roleLabel = (name) =>
  ROLE_LABELS[(name || "").toLowerCase()] ?? name ?? "—";

const ROLE_STYLES = {
  user: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
  expert:
    "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
  admin: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
};

// Mỗi resource 1 màu + icon riêng
const RESOURCE_META = {
  post: {
    label: "Bài viết",
    icon: FileText,
    chip: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
    dot: "text-orange-500",
  },
  product: {
    label: "Sản phẩm",
    icon: Package,
    chip: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
    dot: "text-sky-500",
  },
  category: {
    label: "Danh mục",
    icon: LayoutGrid,
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    dot: "text-emerald-500",
  },
  comment: {
    label: "Bình luận",
    icon: MessageSquare,
    chip: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
    dot: "text-violet-500",
  },
  user: {
    label: "Người dùng",
    icon: Users,
    chip: "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400",
    dot: "text-pink-500",
  },
  role: {
    label: "Vai trò",
    icon: Shield,
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    dot: "text-amber-500",
  },
  permission: {
    label: "Phân quyền",
    icon: KeyRound,
    chip: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
    dot: "text-rose-500",
  },
};
const RESOURCE_DEFAULT = {
  label: "",
  icon: KeyRound,
  chip: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  dot: "text-zinc-400",
};

const ACTION_LABELS = {
  view: "Xem",
  create: "Tạo mới",
  update: "Chỉnh sửa",
  delete: "Xoá",
  manage: "Quản lý dữ liệu người khác",
  hidden: "Ẩn",
  "assign-role": "Gán vai trò",
  "set-permission": "Gán quyền",
  "remove-permission": "Gỡ quyền",
};
const actionLabel = (perm) =>
  ACTION_LABELS[(perm.name || "").split(":")[1]] ?? perm.name;

const normRole = (r) => ({ id: r.id ?? r.Id, name: r.name ?? r.Name ?? "" });
const normPerm = (p) => ({
  id: p.id ?? p.Id,
  name: p.name ?? p.Name ?? "",
  description: p.description ?? p.Description ?? "",
});

// ===== Danh sách quyền của 1 role (chỉ hiển thị) =====
const RolePermissions = ({ role }) => {
  const [perms, setPerms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    GetPermissionForRole(role.id)
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.items ?? res.data?.data ?? res.data ?? [];
        setPerms(
          (Array.isArray(raw) ? raw : [])
            .map(normPerm)
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
      })
      .catch(() => toast.error("Không tải được quyền của role."))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role.id]);

  const groups = useMemo(() => {
    const map = new Map();
    perms.forEach((p) => {
      const resource = (p.name || "").split(":")[0];
      if (!map.has(resource)) map.set(resource, []);
      map.get(resource).push(p);
    });
    return [...map.entries()].map(([resource, items]) => ({
      resource,
      items,
      meta: RESOURCE_META[resource] ?? {
        ...RESOURCE_DEFAULT,
        label: resource,
      },
    }));
  }, [perms]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
            ROLE_STYLES[(role.name || "").toLowerCase()] ??
            "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          <Shield className="size-3.5" />
          {roleLabel(role.name)}
        </span>
        <p className="text-sm text-muted-foreground">
          có{" "}
          <span className="font-semibold text-foreground">{perms.length}</span>{" "}
          quyền trong {groups.length} nhóm
        </p>
      </div>

      {perms.length === 0 ? (
        <p className="rounded-2xl border py-12 text-center text-sm text-muted-foreground">
          Role này chưa được gán quyền nào.
        </p>
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map(({ resource, items, meta }) => {
            const Icon = meta.icon;
            return (
              <div
                key={resource}
                className="overflow-hidden rounded-2xl border bg-card shadow-sm"
              >
                <div className="flex items-center gap-2.5 border-b bg-muted/40 px-4 py-3">
                  <span
                    className={`flex size-8 items-center justify-center rounded-lg ${meta.chip}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm font-semibold">{meta.label}</span>
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {items.length} quyền
                  </span>
                </div>
                <div className="space-y-1 p-2">
                  {items.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-muted/50"
                    >
                      <CircleCheck
                        className={`mt-0.5 size-4 shrink-0 ${meta.dot}`}
                      />
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                          {actionLabel(p)}
                          <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-normal text-muted-foreground">
                            {p.name}
                          </code>
                        </p>
                        {p.description && (
                          <p className="text-xs text-muted-foreground">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ===== Page chính =====
export default function AdminPermissionsPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetAllRole()
      .then((res) => {
        const raw = res.data?.data ?? res.data ?? [];
        setRoles((Array.isArray(raw) ? raw : []).map(normRole));
      })
      .catch(() => toast.error("Không tải được danh sách vai trò."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/40">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-tight">
            Quyền hạn theo vai trò
          </h1>
          <p className="text-sm text-muted-foreground">
            Danh sách các quyền mỗi vai trò đang có (được seed từ hệ thống).
          </p>
        </div>
      </div>

      {roles.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Chưa có vai trò nào.
        </p>
      ) : (
        <Tabs defaultValue={String(roles[0].id)}>
          <TabsList className="w-fit">
            {roles.map((r) => (
              <TabsTrigger key={r.id} value={String(r.id)}>
                {roleLabel(r.name)}
              </TabsTrigger>
            ))}
          </TabsList>
          {roles.map((r) => (
            <TabsContent key={r.id} value={String(r.id)} className="mt-4">
              <RolePermissions role={r} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
