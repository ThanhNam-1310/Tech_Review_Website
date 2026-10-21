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
            className="p-1.5 hover:bg-muted rounded-md shrink-0"
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
            "flex-1 min-w-0 text-left px-3 py-2 rounded-lg text-sm transition-colors",
            activeCategoryId === category.id
              ? "bg-primary text-primary-foreground font-medium"
              : "hover:bg-muted",
            level === 0 && "font-medium",
          )}
        >
          <span className="block truncate">{category.name}</span>
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l pl-2">
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
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          Danh mục
        </h3>

        <div className="rounded-xl border bg-card p-3 shadow-sm max-h-[60vh] overflow-y-auto">
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => onSelect?.(null)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeCategoryId === null
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
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
