import { useEffect, useState } from "react";
import { GetAllCategories } from "@/apis/category.api";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export default function CategoryTreeSelect({ selectedId, onSelect }) {
  const [parents, setParents] = useState([]);
  const [activeParentId, setActiveParentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetAllCategories()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        // Chỉ lấy category cha (ParentId = null)
        const rootCategories = data.filter((c) => !c.parentId);
        setParents(rootCategories);

        // Mặc định chọn parent đầu tiên
        if (rootCategories.length > 0) {
          setActiveParentId(rootCategories[0].id);
        }
      })
      .catch((err) => console.error("Load categories error:", err))
      .finally(() => setLoading(false));
  }, []);

  const activeParent = parents.find((p) => p.id === activeParentId);
  const children = activeParent?.children || [];

  if (loading) {
    return (
      <div className="border rounded-lg p-6 text-center text-muted-foreground text-sm">
        Đang tải danh mục...
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden grid grid-cols-[220px_1fr] min-h-[320px]">
      {/* Cột trái - Category cha */}
      <div className="border-r bg-muted/40">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
          Danh mục cha
        </div>
        <div className="p-1.5 space-y-0.5 max-h-[400px] overflow-y-auto">
          {parents.map((parent) => (
            <button
              key={parent.id}
              type="button"
              onClick={() => {
                setActiveParentId(parent.id);
                onSelect?.(null); // reset selection khi đổi parent
              }}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors",
                activeParentId === parent.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
              )}
            >
              <span className="truncate">{parent.name}</span>
              {parent.children?.length > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" />
              )}
            </button>
          ))}

          {parents.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted-foreground text-center">
              Chưa có danh mục
            </p>
          )}
        </div>
      </div>

      {/* Cột phải - Category con */}
      <div>
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
          Danh mục con
          {activeParent && (
            <span className="ml-1 font-normal normal-case">
              — {activeParent.name}
            </span>
          )}
        </div>
        <div className="p-1.5 space-y-0.5 max-h-[400px] overflow-y-auto">
          {/* Cho phép chọn luôn category cha */}
          {activeParent && (
            <button
              type="button"
              onClick={() => onSelect?.(activeParent)}
              className={cn(
                "w-full px-3 py-2 rounded-md text-sm text-left transition-colors border border-dashed",
                selectedId === activeParent.id
                  ? "bg-orange-50 border-orange-400 text-orange-700 font-medium"
                  : "hover:bg-muted border-transparent",
              )}
            >
              {activeParent.name}{" "}
              <span className="text-xs text-muted-foreground">(cha)</span>
            </button>
          )}

          {children.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => onSelect?.(child)}
              className={cn(
                "w-full px-3 py-2 rounded-md text-sm text-left transition-colors",
                selectedId === child.id
                  ? "bg-orange-50 border border-orange-400 text-orange-700 font-medium"
                  : "hover:bg-muted",
              )}
            >
              {child.name}
            </button>
          ))}

          {children.length === 0 && (
            <p className="px-3 py-6 text-sm text-muted-foreground text-center">
              Không có danh mục con
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
