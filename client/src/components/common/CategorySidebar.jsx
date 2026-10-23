import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function CategoryItem({
  category,
  activeCategoryId,
  onSelect,
  expandedParents,
  toggleParent,
  level = 0,
}) {
  const children = category.children ?? [];
  const hasChildren = children.length > 0;
  const isExpanded = !!expandedParents[category.id];

  return (
    <div>
      <div className="flex items-center">
        <div style={{ width: level * 12 }} />

        {hasChildren ? (
          <button
            type="button"
            onClick={() => toggleParent(category.id)}
            className={cn(
              "p-1.5 rounded-lg shrink-0 text-muted-foreground transition-all hover:bg-orange-500/10 hover:text-orange-600",
              isExpanded && "bg-orange-500/10 text-orange-600",
            )}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform",
                isExpanded && "rotate-90",
              )}
            />
          </button>
        ) : (
          <div className="w-7 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => onSelect?.(category.id)}
          className={cn(
            "flex-1 min-w-0 text-left px-3 py-2 rounded-xl text-sm transition-all duration-200",
            activeCategoryId === category.id
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md shadow-orange-500/30"
              : "text-foreground/75 hover:bg-orange-50 hover:text-orange-700 hover:translate-x-0.5",
            level === 0 && "font-semibold",
          )}
        >
          <span className="block truncate">{category.name}</span>
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-3 mt-1 space-y-1 border-l-2 border-orange-500/20 pl-2">
          {children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              activeCategoryId={activeCategoryId}
              onSelect={onSelect}
              expandedParents={expandedParents}
              toggleParent={toggleParent}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategorySidebar({
  categories = [],
  activeCategoryId = null,
  onSelect,
}) {
  const [expandedParents, setExpandedParents] = useState({});

  const toggleParent = (id) => {
    setExpandedParents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <aside className="w-full lg:w-1/4">
      <div className="lg:sticky lg:top-24 space-y-4">
        <h3 className="border-l-4 border-orange-500 pl-3 text-sm font-bold uppercase tracking-widest text-foreground">
          Danh mục
        </h3>

        <div className="rounded-2xl border bg-gradient-to-b from-card to-muted/40 p-3 shadow-sm ring-1 ring-black/5 max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-orange-500/30 [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onSelect?.(null)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                activeCategoryId === null
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30"
                  : "text-foreground/75 hover:bg-orange-50 hover:text-orange-700 hover:translate-x-0.5",
              )}
            >
              Tất cả
            </button>

            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                activeCategoryId={activeCategoryId}
                onSelect={onSelect}
                expandedParents={expandedParents}
                toggleParent={toggleParent}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
