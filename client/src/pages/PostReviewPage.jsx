import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GetAllPost, GetAllPostByCategoryId } from "@/apis/post.api";
import { GetAllCategories } from "@/apis/category.api";
import PostCard from "@/components/posts/PostCard";
import SectionSplit from "@/components/posts/sections/SectionSplit";
import SectionTodayPicks from "@/components/posts/sections/SectionTodayPicks";
import SectionTopics from "@/components/posts/sections/SectionTopics";

const normalizePost = (p) => {
  const id = p.postId ?? p.PostId ?? p.id;
  const title = p.title ?? p.Title;
  const thumbnail = p.thumbnailUrl ?? p.ThumbnailUrl ?? "";
  const author = p.authorName ?? p.AuthorName ?? "";
  const date = p.publicDate ?? p.PublicDate ?? null;
  const visibility = p.visibility ?? p.Visibility;
  const likes = p.likeCount ?? p.LikeCount ?? 0;
  const views = p.viewCount ?? p.ViewCount ?? 0;
  return {
    ...p,
    id,
    title,
    author,
    authorName: author,
    date,
    publicDate: date,
    thumbnail,
    thumbnailUrl: thumbnail,
    image: thumbnail,
    likes,
    likeCount: likes,
    views,
    viewCount: views,
    visibility,
    isHightLight: p.isHightLight ?? p.IsHightLight ?? false,
    isPrivate: visibility === "PostPrivate" || visibility === 2,
  };
};

const normalizeTopic = (c) => {
  const title = c.name ?? c.Name ?? c.title;
  const thumbnail = c.thumbnailUrl ?? c.ThumbnailUrl ?? c.thumbnail ?? c.image;
  return {
    ...c,
    id: c.id ?? c.Id,
    title,
    name: title,
    description: c.description ?? c.Description,
    thumbnail,
    thumbnailUrl: thumbnail,
    image: thumbnail,
  };
};

const EMPTY_HOME = {
  hero: null,
  highlights: [],
  favorites: [],
  topics: [],
  splitFeatured: null,
  splitPosts: [],
};

const PostReviewPage = () => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  const [home, setHome] = useState(EMPTY_HOME);
  const [loadingHome, setLoadingHome] = useState(true);

  const [catData, setCatData] = useState({ name: "", posts: [] });
  const [loadingCat, setLoadingCat] = useState(false);

  // ===== Mode trang chủ =====
  useEffect(() => {
    if (categoryId) return;
    let cancelled = false;
    setLoadingHome(true);

    Promise.all([
      GetAllPost({ highlight: true, pageSize: 1 }),
      GetAllPost({
        sortBy: "LikeCount",
        sortOrder: "desc",
        days: 7,
        pageSize: 5,
      }),
      GetAllPost({
        sortBy: "LikeCount",
        sortOrder: "desc",
        days: 30,
        pageSize: 5,
      }),
      GetAllPost({ editorPick: true, pageSize: 4 }),
      GetAllCategories(),
    ])
      .then(([heroRes, hotRes, likedRes, pickRes, catRes]) => {
        if (cancelled) return;

        const itemsOf = (res) => (res.data?.items ?? []).map(normalizePost);
        const seen = new Set();
        const dedupe = (items) =>
          items.filter((p) => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
          });

        let hero = itemsOf(heroRes)[0] ?? null;
        if (hero) seen.add(hero.id);

        const favorites = dedupe(itemsOf(likedRes));
        let highlights = dedupe(itemsOf(hotRes));

        if (!hero) {
          hero = highlights[0] ?? favorites[0] ?? null;
          if (hero) highlights = highlights.filter((p) => p.id !== hero.id);
        }

        const picks = dedupe(itemsOf(pickRes));

        setHome({
          hero,
          highlights,
          favorites,
          topics: (catRes.data ?? []).slice(0, 4).map(normalizeTopic),
          splitFeatured: picks[0] ?? null,
          splitPosts: picks.slice(1),
        });
      })
      .catch((err) => {
        if (!cancelled) console.error("Lỗi load trang chủ post:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingHome(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  // ===== Mode lọc theo chủ đề (?categoryId=) =====
  useEffect(() => {
    if (!categoryId) return;
    let cancelled = false;
    setLoadingCat(true);

    Promise.all([
      GetAllPostByCategoryId(categoryId, { pageNumber: 1, pageSize: 20 }),
      GetAllCategories(),
    ])
      .then(([res, catRes]) => {
        if (cancelled) return;
        const cats = catRes.data ?? [];
        const found = cats.find(
          (c) => String(c.id ?? c.Id) === String(categoryId),
        );
        setCatData({
          name: found?.name ?? found?.Name ?? "Chủ đề",
          posts: (res.data?.items ?? []).map(normalizePost),
        });
      })
      .catch((err) => {
        if (!cancelled) console.error("Lỗi load bài theo chủ đề:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingCat(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  // ===== Render: mode chủ đề =====
  if (categoryId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <Link
            to="/post"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Tất cả bài viết
          </Link>
          <h1 className="text-2xl font-bold mt-2 mb-6">{catData.name}</h1>
          {loadingCat ? (
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          ) : catData.posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có bài viết nào.
            </p>
          ) : (
            <div className="flex flex-col divide-y">
              {catData.posts.map((p) => (
                <PostCard key={p.id} post={p} variant="row" />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== Render: trang chủ =====
  if (loadingHome) {
    return (
      <p className="text-center py-20 text-sm text-muted-foreground">
        Đang tải bài viết...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 md:py-14 space-y-16 md:space-y-20">
        <SectionTodayPicks
          highlights={home.highlights}
          featured={home.hero}
          favorites={home.favorites}
        />

        <SectionTopics topics={home.topics} />

        <SectionSplit
          featured={home.splitFeatured}
          posts={home.splitPosts}
          title="Truyền cảm hứng"
        />
      </div>
    </div>
  );
};

export default PostReviewPage;
