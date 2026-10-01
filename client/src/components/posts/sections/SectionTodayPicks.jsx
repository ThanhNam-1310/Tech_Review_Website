import PostCard from "../PostCard";
import PostTextItem from "../PostTextItem";

const SectionTodayPicks = ({ highlights = [], featured, favorites = [] }) => {
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-0">
        {/* ===== TRÁI + GIỮA ===== */}
        <div className="lg:col-span-3">
          {/* Đường kẻ ngang chung + nhãn */}
          <div className="relative mb-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />
            <h3 className="relative inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground">
              Nổi bật hôm nay
            </h3>
          </div>

          {/* 2 cột con: trái | giữa — khoảng cách đều, có kẻ dọc */}
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-0">
            {/* Trái */}
            <div className="lg:col-span-1 order-2 lg:order-1 lg:border-r lg:border-border lg:pr-6">
              <ul className="space-y-4">
                {highlights.map((item, index) => (
                  <li key={item.id}>
                    <PostTextItem post={item} index={index} showIndex />
                  </li>
                ))}
              </ul>
            </div>

            {/* Giữa */}
            <div className="lg:col-span-2 order-1 lg:order-2 lg:pl-6">
              {featured && <PostCard post={featured} variant="featured" />}
            </div>
          </div>
        </div>

        {/* ===== PHẢI ===== */}
        <div className="lg:col-span-1 lg:border-l lg:border-border lg:pl-6">
          <div className="relative mb-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />
            <h3 className="relative inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-1 bg-primary text-primary-foreground">
              Yêu thích
            </h3>
          </div>

          <ul className="space-y-4">
            {favorites.map((item) => (
              <li key={item.id}>
                <PostTextItem post={item} showLikes />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default SectionTodayPicks;
