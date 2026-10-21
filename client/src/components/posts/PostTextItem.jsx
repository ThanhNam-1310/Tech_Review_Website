import React from "react";
import { Link } from "react-router-dom";
import { Eye, Heart, Star } from "lucide-react";

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("vi-VN");
};

const PostTextItem = ({
  post,
  index,
  showIndex = false,
  showLikes = false,
}) => {
  return (
    <Link to={`/post/${post.id}`} className="group block">
      <div className="flex gap-3 border-2 px-2 py-1.5">
        <div className="flex-1 min-w-0">
          {(showIndex || post.isHightLight) && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {showIndex && `${String(index + 1).padStart(2, "0")} · `}
              {post.isHightLight && (
                <span className="inline-flex items-center gap-0.5 font-medium text-amber-600">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  Nổi bật
                </span>
              )}
            </span>
          )}

          <p className="font-medium leading-snug mt-0.5 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </p>

          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
            {post.authorName && (
              <span className="font-medium text-foreground/70">
                {post.authorName}
              </span>
            )}
            {post.publicDate && <span>{formatDate(post.publicDate)}</span>}
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.viewCount ?? 0}
            </span>
          </p>
        </div>

        {showLikes && post.likeCount != null && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Heart className="h-3.5 w-3.5" />
            {post.likeCount}
          </div>
        )}
      </div>
    </Link>
  );
};

export default PostTextItem;
