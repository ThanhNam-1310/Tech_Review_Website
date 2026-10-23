
import os
import re
import unicodedata
import warnings

import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.pipeline import Pipeline


NHAN = ["negative", "neutral", "positive"]

ANH_XA_NHAN_SO = {
    "0": "negative",
    "1": "neutral",
    "2": "positive",
}


# Bước 1: Đọc và chuẩn hóa dữ liệu
def doc_du_lieu(duong_dan_csv: str) -> pd.DataFrame:
    du_lieu = pd.read_csv(duong_dan_csv)

    # Hỗ trợ cả tên cột comment và text
    if "text" not in du_lieu.columns and "comment" in du_lieu.columns:
        du_lieu = du_lieu.rename(columns={"comment": "text"})

    if not {"text", "label"}.issubset(du_lieu.columns):
        raise ValueError(
            f"{duong_dan_csv} phải có 2 cột text/comment và label."
        )

    du_lieu = du_lieu[["text", "label"]].dropna().copy()
    du_lieu["text"] = du_lieu["text"].astype(str).str.strip()

    # Chuẩn hóa nhãn số hoặc nhãn chữ
    def chuan_hoa_nhan(nhan):
        nhan = str(nhan).strip().lower()

        if nhan.endswith(".0") and nhan[:-2].isdigit():
            nhan = nhan[:-2]

        return ANH_XA_NHAN_SO.get(nhan, nhan)

    du_lieu["label"] = du_lieu["label"].map(chuan_hoa_nhan)

    # Loại bình luận rỗng
    du_lieu = du_lieu[du_lieu["text"] != ""]

    # Báo lỗi nếu có nhãn không hợp lệ
    nhan_khong_hop_le = set(du_lieu["label"]) - set(NHAN)
    if nhan_khong_hop_le:
        raise ValueError(
            f"Nhãn không hợp lệ trong {duong_dan_csv}: "
            f"{nhan_khong_hop_le}"
        )

    if du_lieu.empty:
        raise ValueError(f"Không có dữ liệu hợp lệ: {duong_dan_csv}")

    return du_lieu.reset_index(drop=True)


# Bước 2: Tiền xử lý văn bản
def lam_sach_van_ban(van_ban: str) -> str:
    van_ban = unicodedata.normalize("NFC", str(van_ban)).lower()

    # Loại bỏ URL
    van_ban = re.sub(
        r"https?://\S+|www\.\S+",
        " ",
        van_ban
    )

    # Loại bỏ ký tự đặc biệt, giữ chữ, số và dấu gạch dưới
    van_ban = re.sub(r"[^\w\s]", " ", van_ban)

    # Chuẩn hóa khoảng trắng
    return " ".join(van_ban.split())


class MoHinhPhanLoaiBinhLuan:
    def __init__(
        self,
        duong_dan_mo_hinh: str = "models/comment_lr.pkl"
    ):
        self.duong_dan_mo_hinh = duong_dan_mo_hinh
        self.mo_hinh = None

    # Bước 3 + 4: Huấn luyện mô hình
    def huan_luyen(
        self,
        duong_dan_train: str,
        duong_dan_test: str
    ) -> dict:

        du_lieu_train = doc_du_lieu(duong_dan_train)
        du_lieu_test = doc_du_lieu(duong_dan_test)

        X_train = du_lieu_train["text"]
        y_train = du_lieu_train["label"]

        X_test = du_lieu_test["text"]
        y_test = du_lieu_test["label"]

        # Cảnh báo nếu có bình luận trùng giữa train và test
        tap_train = set(X_train.map(lam_sach_van_ban))
        tap_test = set(X_test.map(lam_sach_van_ban))

        so_trung = len(tap_train & tap_test)
        if so_trung:
            warnings.warn(
                f"Có {so_trung} nội dung trùng giữa train và test. "
                "Hãy kiểm tra khả năng rò rỉ dữ liệu."
            )

        # Pipeline: tiền xử lý -> TF-IDF -> Logistic Regression
        self.mo_hinh = Pipeline([
            (
                "tfidf",
                TfidfVectorizer(
                    preprocessor=lam_sach_van_ban,
                    ngram_range=(1, 2),
                    max_features=30000
                )
            ),
            (
                "logistic_regression",
                LogisticRegression(
                    max_iter=1000,
                    class_weight="balanced",
                    random_state=42
                )
            )
        ])

        # Chỉ fit trên tập train
        self.mo_hinh.fit(X_train, y_train)

        # Đánh giá trên tập test độc lập
        y_du_doan = self.mo_hinh.predict(X_test)

        chi_tiet = [
            {
                "van_ban": van_ban,
                "nhan_that": nhan_that,
                "nhan_du_doan": nhan_du_doan,
                "dung": nhan_that == nhan_du_doan
            }
            for van_ban, nhan_that, nhan_du_doan
            in zip(X_test, y_test, y_du_doan)
        ]

        tong_mau = len(y_du_doan)

        # Tỷ lệ nhãn mà mô hình dự đoán
        dem_nhan = pd.Series(y_du_doan).value_counts()

        ty_le_phan_lop = {
            nhan: round(
                dem_nhan.get(nhan, 0) / tong_mau * 100, 2
            )
            for nhan in NHAN
        }

        ket_qua = {
            "so_mau_train": len(du_lieu_train),
            "so_mau_test": len(du_lieu_test),
            "accuracy": accuracy_score(y_test, y_du_doan),
            "f1_score": f1_score(
                y_test,
                y_du_doan,
                labels=NHAN,
                average="macro",
                zero_division=0
            ),
            "bao_cao": classification_report(
                y_test,
                y_du_doan,
                labels=NHAN,
                target_names=NHAN,
                zero_division=0
            ),
            "ma_tran_nham_lan": confusion_matrix(
                y_test,
                y_du_doan,
                labels=NHAN
            ).tolist(),
            "chi_tiet_phan_lop": chi_tiet,
            "ty_le_phan_lop": ty_le_phan_lop,
        }

        # Lưu toàn bộ pipeline
        os.makedirs(
            os.path.dirname(self.duong_dan_mo_hinh) or ".",
            exist_ok=True
        )
        joblib.dump(self.mo_hinh, self.duong_dan_mo_hinh)

        return ket_qua

    # Nạp mô hình đã lưu
    def tai_mo_hinh(self) -> None:
        self.mo_hinh = joblib.load(self.duong_dan_mo_hinh)

    # Dự đoán một bình luận
    def du_doan(self, van_ban: str) -> str:
        if self.mo_hinh is None:
            raise RuntimeError(
                "Chưa có mô hình. Hãy huấn luyện hoặc gọi tai_mo_hinh()."
            )

        return str(self.mo_hinh.predict([van_ban])[0])

    # Dự đoán nhãn và xác suất của từng lớp
    def du_doan_xac_suat(self, van_ban: str) -> dict:
        if self.mo_hinh is None:
            raise RuntimeError(
                "Chưa có mô hình. Hãy huấn luyện hoặc gọi tai_mo_hinh()."
            )

        xac_suat = self.mo_hinh.predict_proba([van_ban])[0]
        cac_nhan = self.mo_hinh.named_steps[
            "logistic_regression"
        ].classes_

        return {
            "nhan": str(cac_nhan[xac_suat.argmax()]),
            "xac_suat": {
                str(nhan): round(float(xs), 4)
                for nhan, xs in zip(cac_nhan, xac_suat)
            }
        }
