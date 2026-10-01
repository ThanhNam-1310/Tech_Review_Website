import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const PostTextItem = ({
  post,
  index,
  showIndex = false,
  showLikes = false,
}) => {
  return (
    <Link to={`/post/${post.slug || post.id}`} className="group block">
      <div className="flex gap-3 border-2 px-2">
        <div className="flex-1 min-w-0">
          {(showIndex || post.category) && (
            <span className="text-xs text-muted-foreground">
              {showIndex && `${String(index + 1).padStart(2, "0")} · `}
              {post.category}
            </span>
          )}
          <p className="font-medium leading-snug mt-0.5 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </p>
        </div>

        {showLikes && post.likes != null && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Heart className="h-3.5 w-3.5" />
            {post.likes}
          </div>
        )}
      </div>
    </Link>
  );
};

export default PostTextItem;
