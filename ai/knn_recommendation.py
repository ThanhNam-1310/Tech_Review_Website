from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def recommend(data):
    items = data.items
    item_id = data.item_id

    # Tìm bài viết hoặc sản phẩm đang xem
    target_index = next(
        (i for i, item in enumerate(items) if item.id == item_id),
        None
    )

    if target_index is None or len(items) < 2:
        return []

    # Ghép thông tin thành văn bản để so sánh
    texts = [
        f"{item.title} {item.description} "
        f"{item.category} {item.content}"
        for item in items
    ]

    # Chuyển văn bản thành vector TF-IDF
    vectorizer = TfidfVectorizer(
        lowercase=True,
        strip_accents="unicode",
        ngram_range=(1, 2)
    )

    try:
        matrix = vectorizer.fit_transform(texts)
    except ValueError:
        return []

    # Tính độ tương đồng với đối tượng đang xem
    scores = cosine_similarity(
        matrix[target_index],
        matrix
    ).flatten()

    # Lấy các đối tượng khác và sắp xếp theo độ tương đồng
    results = [
        {
            "itemId": item.id,
            "title": item.title,
            "score": round(float(scores[i]), 4)
        }
        for i, item in enumerate(items)
        if i != target_index
    ]

    results.sort(key=lambda x: x["score"], reverse=True)

    return results[:data.limit]