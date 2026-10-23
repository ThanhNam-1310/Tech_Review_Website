
from pathlib import Path

from logistic_regression import MoHinhPhanLoaiBinhLuan


# ==================== CẤU HÌNH ====================

THU_MUC_GOC = Path(__file__).resolve().parent

DUONG_DAN_TRAIN = THU_MUC_GOC / "data" / "train.csv"
DUONG_DAN_TEST = THU_MUC_GOC / "data" / "test.csv"
DUONG_DAN_MO_HINH = THU_MUC_GOC / "models" / "comment_lr.pkl"

BINH_LUAN_MAU = [
    "Pin máy này trâu thật, màn hình đẹp nữa",
    "Dùng lag quá, máy nhanh nóng, rất thất vọng",
    "Sản phẩm này còn hàng không mọi người",
    "Camera chụp mờ quá, loa lại rè nữa",
    "Máy này không tốt như quảng cáo đâu",
]


def xuat_bang_doi_chieu(ket_qua):
    chi_tiet = ket_qua["chi_tiet_phan_lop"]
    so_dung = sum(dong["dung"] for dong in chi_tiet)

    thu_muc_ket_qua = THU_MUC_GOC / "results"
    thu_muc_ket_qua.mkdir(parents=True, exist_ok=True)

    duong_dan_txt = thu_muc_ket_qua / "ket_qua_phan_loai.txt"

    with open(duong_dan_txt, "w", encoding="utf-8") as file:
        # Ghi thông tin tổng quan
        file.write("KET QUA PHAN LOAI BINH LUAN\n")
        file.write(f"So mau test: {ket_qua['so_mau_test']}\n")
        file.write(f"So mau dung: {so_dung}\n")
        file.write(f"So mau sai: {len(chi_tiet) - so_dung}\n")
        file.write(f"Accuracy: {ket_qua['accuracy'] * 100:.2f}%\n")
        file.write(f"Macro F1: {ket_qua['f1_score']:.4f}\n\n")

        # Mỗi mẫu nằm trên một dòng
        file.write("STT | NHAN THAT | NHAN DU DOAN | KET QUA | BINH LUAN\n")

        for i, dong in enumerate(chi_tiet, start=1):
            trang_thai = "DUNG" if dong["dung"] else "SAI"

            # Loại bỏ xuống dòng để mỗi mẫu chỉ nằm trên một dòng
            van_ban = " ".join(dong["van_ban"].split())

            file.write(
                f"{i} | "
                f"{dong['nhan_that']} | "
                f"{dong['nhan_du_doan']} | "
                f"{trang_thai} | "
                f"{van_ban}\n"
            )

    print(f"\nDa xuat ket qua tai: {duong_dan_txt}")
    


def huan_luyen_phan_loai():
    mo_hinh = MoHinhPhanLoaiBinhLuan(str(DUONG_DAN_MO_HINH))

    ket_qua = mo_hinh.huan_luyen(
        str(DUONG_DAN_TRAIN),
        str(DUONG_DAN_TEST)
    )

    print("=" * 60)
    print("KET QUA DANH GIA LOGISTIC REGRESSION")
    print("=" * 60)

    print(f"So mau train : {ket_qua['so_mau_train']}")
    print(f"So mau test  : {ket_qua['so_mau_test']}")
    print(f"Accuracy     : {ket_qua['accuracy']:.4f}")
    print(f"Macro F1     : {ket_qua['f1_score']:.4f}")

    print("\nBAO CAO PHAN LOAI")
    print(ket_qua["bao_cao"])

    print("\nMA TRAN NHAM LAN")
    for hang in ket_qua["ma_tran_nham_lan"]:
        print(hang)

    xuat_bang_doi_chieu(ket_qua)

    print("\nTY LE NHAN DU DOAN TREN TAP TEST")
    for nhan, ty_le in ket_qua["ty_le_phan_lop"].items():
        print(f"{nhan}: {ty_le:.2f}%")

    print(f"\nMô hình đã lưu tại: {DUONG_DAN_MO_HINH}")

    print("\nDU DOAN BINH LUAN MOI")
    for binh_luan in BINH_LUAN_MAU:
        ket_qua_du_doan = mo_hinh.du_doan_xac_suat(binh_luan)

        print(f"\nBình luận: {binh_luan}")
        print(f"Nhãn dự đoán: {ket_qua_du_doan['nhan']}")
        print(f"Xác suất: {ket_qua_du_doan['xac_suat']}")



def main():
    # Huấn luyện mô hình phân loại bình luận
    huan_luyen_phan_loai()


if __name__ == "__main__":
    main()
