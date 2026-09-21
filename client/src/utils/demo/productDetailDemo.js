export const productDetail = {
  id: 1,
  name: "iPhone 16 Pro",
  slug: "iphone-16-pro",
  categoryName: "Smartphone",
  score: 8.8,
  price: "28.990.000đ",
  image: "https://images.unsplash.com/photo-1695048133142-1a20484428d2?w=800&q=80",
  images: [
    "https://images.unsplash.com/photo-1695048133142-1a20484428d2?w=800&q=80",
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80",
  ],
  summary:
    "iPhone 16 Pro mang đến nâng cấp đáng kể về camera, hiệu năng và thời lượng pin. Đây là lựa chọn hàng đầu trong phân khúc cao cấp năm 2026.",
  pros: [
    "Camera xuất sắc, đặc biệt là chế độ zoom",
    "Hiệu năng mạnh mẽ, mượt mà",
    "Pin trâu hơn thế hệ trước",
    "Màn hình sáng và sắc nét",
  ],
  cons: [
    "Giá thành cao",
    "Không có nhiều cải tiến về thiết kế",
    "Cổng USB-C vẫn bị giới hạn tốc độ ở một số model",
  ],
  specs: [
    { label: "Màn hình", value: "6.3 inch OLED, 120Hz" },
    { label: "Chip", value: "A18 Pro" },
    { label: "RAM", value: "8GB" },
    { label: "Bộ nhớ", value: "128GB / 256GB / 512GB / 1TB" },
    { label: "Camera", value: "48MP + 48MP + 12MP" },
    { label: "Pin", value: "Lên đến 27 giờ xem video" },
  ],
  author: "Minh Trần",
  publishedAt: "18/09/2026",
  readTime: "8 phút đọc",
};

export const comments = [
  {
    id: 1,
    user: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/100?img=1",
    content: "Mình dùng được 1 tuần rồi, camera đúng là đỉnh. Pin cũng tốt hơn hẳn so với 15 Pro.",
    createdAt: "2 ngày trước",
    likes: 12,
  },
  {
    id: 2,
    user: "Trần Thị B",
    avatar: "https://i.pravatar.cc/100?img=5",
    content: "Giá hơi cao nhưng cảm thấy đáng tiền. Nhất là khi quay video.",
    createdAt: "3 ngày trước",
    likes: 8,
  },
  {
    id: 3,
    user: "Lê Hoàng C",
    avatar: "https://i.pravatar.cc/100?img=8",
    content: "Có nên lên từ 14 Pro Max không anh em? Đang phân vân.",
    createdAt: "5 ngày trước",
    likes: 5,
  },
];