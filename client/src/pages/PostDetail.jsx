import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Eye, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Comments from "@/components/common/Comment";
import { GetDetailPostById } from "@/apis/post.api";
import Recommendations from "@/components/common/Recommendations";

// PostContentType ở BE: Image = 1, Text = 2
const CONTENT_TYPE = { Image: 1, Text: 2 };

export default function PostDetail() {
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("Không tìm thấy ID bài viết.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await GetDetailPostById(id);
        const result = res.data?.data ?? res.data;

        if (!result || typeof result !== "object") {
          setError("Dữ liệu bài viết không hợp lệ.");
          return;
        }

        setPost(result);
      } catch (err) {
        console.error("Fetch post error:", err.response?.data || err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.title ||
            "Không thể tải thông tin bài viết.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-16 text-center text-muted-foreground">
        Đang tải thông tin bài viết...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5">
            <Link to="/post">
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Link>
          </Button>

          <p className="py-16 text-center text-destructive">
            {error || "Không tìm thấy bài viết."}
          </p>
        </div>
      </div>
    );
  }

  const rating = post.rating ?? {};
  const authorName = post.authorName || "Thành viên";
  const contents = post.contents ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5">
            <Link to="/post">
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Link>
          </Button>
        </div>

        <article className="mx-auto max-w-3xl">
          {/* Title */}
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {post.title}
          </h1>

          {/* Author + date + rating */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={post.authorAvatar || ""} />
                <AvatarFallback>
                  {authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="text-sm font-medium text-foreground">
                  {authorName}
                </p>
                <p className="text-xs">
                  {post.publicDate
                    ? new Date(post.publicDate).toLocaleDateString("vi-VN")
                    : "Chưa xuất bản"}
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {rating.viewCount ?? 0}
            </span>

            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {rating.likeCount ?? 0}
            </span>
          </div>

          {/* Thumbnail */}
          {post.thumbnailUrl && (
            <div className="mb-8 aspect-[16/9] overflow-hidden rounded-2xl border bg-muted">
              <img
                src={post.thumbnailUrl}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          {post.description && (
            <p className="mb-8 border-l-4 border-primary/40 pl-4 text-lg leading-relaxed text-muted-foreground">
              {post.description}
            </p>
          )}

          {/* Post contents: type 2 = đoạn văn, type 1 = ảnh */}
          <div className="mb-4 space-y-5">
            {contents.map((content, index) => (
              <div key={content.id ?? index}>
                {content.type === CONTENT_TYPE.Text ? (
                  <p className="whitespace-pre-line leading-relaxed">
                    {content.valueContent}
                  </p>
                ) : content.type === CONTENT_TYPE.Image ? (
                  content.valueContent && (
                    <img
                      src={content.valueContent}
                      alt={`Nội dung ${index + 1}`}
                      className="h-auto max-h-[600px] w-full rounded-xl object-contain"
                      loading="lazy"
                    />
                  )
                ) : null}
              </div>
            ))}
          </div>
        </article>

        <Separator className="mx-auto my-10 max-w-3xl md:my-14" />

        {/* Comments */}
        <div className="mx-auto max-w-3xl">
          <Comments type="post" targetId={id} />
        </div>

        <Separator className="mx-auto my-10 max-w-3xl md:my-14" />
        <Recommendations type="post" id={id} title="Bài viết liên quan" />
      </div>
    </div>
  );
}
