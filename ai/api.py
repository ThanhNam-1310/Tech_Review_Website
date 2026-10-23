from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, ConfigDict

from logistic_regression import MoHinhPhanLoaiBinhLuan
from knn_recommendation import recommend


# ==================== CẤU HÌNH ====================

DUONG_DAN_MO_HINH = "models/comment_lr.pkl"

NHAN_TIENG_VIET = {
    "positive": "Tích cực",
    "negative": "Tiêu cực",
    "neutral": "Trung lập",
}

app = FastAPI(title="Tech Review - AI API")


# ==================== NẠP MÔ HÌNH ====================

mo_hinh = MoHinhPhanLoaiBinhLuan(DUONG_DAN_MO_HINH)

try:
    mo_hinh.tai_mo_hinh()
    MO_HINH_SAN_SANG = True
except Exception as e:
    print(f"Không thể nạp mô hình phân loại bình luận: {e}")
    MO_HINH_SAN_SANG = False


# ==================== DTO ====================

class YeuCauPhanLoai(BaseModel):
    text: str


class KetQuaPhanLoai(BaseModel):
    text: str
    label: str
    label_viet: str


# Dữ liệu Product hoặc Post do BE gửi
class RecommendationItem(BaseModel):
    id: str
    title: str
    description: str = ""
    category: str = ""
    content: str = ""


# Yêu cầu gợi ý từ BE
class YeuCauGoiY(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    item_type: str = Field(alias="itemType")
    item_id: str = Field(alias="itemId")
    limit: int = Field(default=10, ge=1, le=50)
    items: list[RecommendationItem] = Field(default_factory=list)


# ==================== ENDPOINT ====================

@app.get("/health")
def kiem_tra():
    return {
        "status": "ok",
        "comment_model_loaded": MO_HINH_SAN_SANG,
        "recommendation_ready": True,
    }


# Phân loại cảm xúc bình luận
@app.post("/ml/comment/analyze", response_model=KetQuaPhanLoai)
def phan_loai_binh_luan(yeu_cau: YeuCauPhanLoai):
    if not MO_HINH_SAN_SANG:
        raise HTTPException(
            status_code=503,
            detail="Mô hình phân loại chưa sẵn sàng. Hãy chạy main.py trước."
        )

    if not yeu_cau.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Bình luận rỗng."
        )

    nhan = mo_hinh.du_doan(yeu_cau.text)

    return KetQuaPhanLoai(
        text=yeu_cau.text,
        label=nhan,
        label_viet=NHAN_TIENG_VIET.get(nhan, nhan)
    )


# Gợi ý sản phẩm hoặc bài viết
@app.post("/recommendations")
def goi_y(yeu_cau: YeuCauGoiY):
    item_type = yeu_cau.item_type.strip().lower()

    if item_type not in ["product", "post"]:
        raise HTTPException(
            status_code=400,
            detail="itemType chỉ nhận 'product' hoặc 'post'."
        )

    if not yeu_cau.items:
        raise HTTPException(
            status_code=400,
            detail="Danh sách items không được rỗng."
        )

    try:
        # Tính độ tương đồng từ dữ liệu BE gửi
        recommendations = recommend(yeu_cau)

        # ===== LOG KẾT QUẢ KNN (bảng có khung) =====
        doi_tuong = next(
            (it for it in yeu_cau.items if it.id == yeu_cau.item_id),
            None
        )
        ten_doi_tuong = doi_tuong.title if doi_tuong else "(không tìm thấy)"
        loai = "sản phẩm" if item_type == "product" else "bài viết"

        print("=" * 60, flush=True)
        print("GỢI Ý KNN — KẾT QUẢ TÍNH ĐỘ TƯƠNG ĐỒNG", flush=True)
        print("=" * 60, flush=True)
        print(f"Đang xem : [{yeu_cau.item_id}] {ten_doi_tuong}", flush=True)
        print(
            f"So sánh  : {len(yeu_cau.items)} item | Lấy top {len(recommendations)}",
            flush=True,
        )
        print("-" * 60, flush=True)
        if recommendations:
            for i, dong in enumerate(recommendations, start=1):
                print(
                    f"{i:>2}. {dong['title'][:38]:.<40} "
                    f"{dong['score']:.4f} ({dong['score'] * 100:.2f}%)",
                    flush=True,
                )
        else:
            print("(Không có kết quả gợi ý)", flush=True)
        print("-" * 60, flush=True)
        print(f"=> Trả về {len(recommendations)} {loai} gợi ý", flush=True)
        print("=" * 60, flush=True)

        return {
            "itemType": item_type,
            "itemId": yeu_cau.item_id,
            "recommendations": recommendations
        }

    except Exception as e:
        print(f"Lỗi gợi ý: {e}")
        raise HTTPException(
            status_code=500,
            detail="Có lỗi khi xử lý gợi ý."
        )