import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
            {/* Tất cả */}
            <button
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

            {categories.map((category) => {
              const hasChildren = category.children?.length > 0;
              const isExpanded = expandedParents[category.id];

              return (
                <div key={category.id}>
                  <div className="flex items-center">
                    {hasChildren ? (
                      <button
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
                      <div className="w-7" />
                    )}

                    <button
                      onClick={() => onSelect?.(category.id)}
                      className={cn(
                        "flex-1 text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        activeCategoryId === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted",
                      )}
                    >
                      {category.name}
                    </button>
                  </div>

                  {hasChildren && isExpanded && (
                    <div className="ml-7 mt-0.5 space-y-0.5 border-l pl-2">
                      {category.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => onSelect?.(child.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            activeCategoryId === child.id
                              ? "bg-primary text-primary-foreground font-medium"
                              : "hover:bg-muted text-muted-foreground",
                          )}
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
