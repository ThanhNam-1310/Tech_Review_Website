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
      <div className="flex gap-3 rounded-xl border border-sky-100 bg-white px-3 py-2.5 transition-colors group-hover:border-sky-200 group-hover:bg-sky-50/50">
        <div className="flex-1 min-w-0">
          {(showIndex || post.isHightLight) && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              {showIndex && `${String(index + 1).padStart(2, "0")} · `}
              {post.isHightLight && (
                <span className="inline-flex items-center gap-0.5 font-medium text-teal-600">
                  <Star className="h-3 w-3 fill-teal-500 text-teal-500" />
                  Nổi bật
                </span>
              )}
            </span>
          )}

          <p className="font-medium leading-snug mt-0.5 group-hover:text-sky-600 transition-colors line-clamp-2">
            {post.title}
          </p>

          <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-slate-500">
            {post.authorName && (
              <span className="font-medium text-slate-600">
                {post.authorName}
              </span>
            )}
            {post.publicDate && <span>{formatDate(post.publicDate)}</span>}
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-sky-500" />
              {post.viewCount ?? 0}
            </span>
          </p>
        </div>

        {showLikes && post.likeCount != null && (
          <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            {post.likeCount}
          </div>
        )}
      </div>
    </Link>
  );
};

export default PostTextItem;
