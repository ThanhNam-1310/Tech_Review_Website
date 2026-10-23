import { Link } from "react-router-dom";
import { Cpu, Globe, MessageCircle, Share2, Play } from "lucide-react";

const KHAAM_PHA_LINKS = [
  { to: "/", label: "Trang chủ" },
  { to: "/post", label: "Bài viết" },
  { to: "/products", label: "Sản phẩm" },
  { to: "/post/new", label: "Viết bài mới" },
];

const TAI_KHOAN_LINKS = [
  { to: "/profile", label: "Hồ sơ của tôi" },
  { to: "/my-posts", label: "Bài viết của tôi" },
  { to: "/my-products", label: "Sản phẩm của tôi" },
];

const CotLink = ({ title, links }) => (
  <div>
    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-900">
      {title}
    </h4>
    <ul className="space-y-2">
      {links.map((l) => (
        <li key={l.to}>
          <Link
            to={l.to}
            className="text-sm text-zinc-600 transition-colors hover:text-orange-600"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default function Footer() {
  return (
    <footer className="border-t border-orange-200/60 bg-gradient-to-r from-amber-50 via-orange-50 to-orange-100 text-zinc-600">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Thương hiệu + giới thiệu */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25">
                <Cpu className="size-5" />
              </span>
              <span className="text-lg font-bold text-zinc-900">
                Tech<span className="text-orange-500">Review</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-600">
              Nền tảng đánh giá công nghệ — đọc review thật, so sánh sản phẩm và
              chọn đúng món đồ phù hợp với bạn.
            </p>
            <div className="mt-4 flex gap-2">
              {[
                { icon: Globe, label: "Trang web" },
                { icon: MessageCircle, label: "Cộng đồng" },
                { icon: Share2, label: "Chia sẻ" },
                { icon: Play, label: "Video" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  title={label}
                  className="flex size-9 items-center justify-center rounded-full border border-orange-200 bg-white/60 text-zinc-500 transition-colors hover:border-orange-400 hover:bg-white hover:text-orange-600"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <CotLink title="Khám phá" links={KHAAM_PHA_LINKS} />
          <CotLink title="Tài khoản" links={TAI_KHOAN_LINKS} />
        </div>

        {/* Dòng cuối */}
        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-orange-200/70 pt-6 text-sm text-zinc-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-medium text-zinc-900">
              Tech<span className="text-orange-500">Review</span>
            </span>
            . Bảo lưu mọi quyền.
          </p>
          <p>Đánh giá công nghệ — chọn đúng, mua chuẩn.</p>
        </div>
      </div>
    </footer>
  );
}
