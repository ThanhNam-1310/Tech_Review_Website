import * as yup from "yup";

// Chạy schema lên toàn bộ values, trả về { "field.path": "message" }, rỗng nếu hợp lệ
export async function validateSchema(schema, values) {
  try {
    await schema.validate(values, { abortEarly: false });
    return {};
  } catch (err) {
    const errors = {};
    err.inner.forEach((e) => {
      if (e.path && !(e.path in errors)) errors[e.path] = e.message;
    });
    return errors;
  }
}

// Class viền đỏ gắn thêm vào input/select/textarea khi field đó có lỗi
export const errCls = (hasError) =>
  hasError
    ? " border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400"
    : "";

// ===== Auth — LoginDTOValidator / RegisterDTOValidator =====
export const loginSchema = yup.object({
  userName: yup.string().trim().required("Tên đăng nhập không được để trống."),
  password: yup.string().required("Mật khẩu không được để trống."),
});

export const registerSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .required("Họ tên không được để trống.")
    .max(100, "Họ tên tối đa 100 ký tự."),
  email: yup
    .string()
    .trim()
    .required("Email không được để trống.")
    .max(254, "Email tối đa 254 ký tự.")
    .email("Email không đúng định dạng."),
  userName: yup
    .string()
    .trim()
    .required("Tên đăng nhập không được để trống.")
    .min(3, "Tên đăng nhập tối thiểu 3 ký tự.")
    .max(50, "Tên đăng nhập tối đa 50 ký tự."),
  password: yup
    .string()
    .required("Mật khẩu không được để trống.")
    .min(6, "Mật khẩu tối thiểu 6 ký tự.")
    .max(100, "Mật khẩu tối đa 100 ký tự."),
  confirmPassword: yup
    .string()
    .required("Xác nhận mật khẩu không được để trống.")
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp."),
});

// ===== Category — Create/UpdateCategoryDTOValidator (2 mode cùng rule) =====
export const categorySchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Tên danh mục không được để trống.")
    .max(100, "Tên danh mục tối đa 100 ký tự."),
});

// ===== Specification — SpecificationCreateDTOValidator =====
export const specificationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Tên thông số không được để trống.")
    .max(100, "Tên thông số tối đa 100 ký tự."),
});

// ===== User — BE chưa có validator cho cập nhật user, mượn rule FullName/Email của RegisterDTO =====
export const userUpdateSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .required("Họ tên không được để trống.")
    .max(100, "Họ tên tối đa 100 ký tự."),
  email: yup
    .string()
    .trim()
    .required("Email không được để trống.")
    .max(254, "Email tối đa 254 ký tự.")
    .email("Email không đúng định dạng."),
});

// ===== Post =====
// Khối nội dung ở FE: text thì value là đoạn văn, image thì có file mới chọn hoặc URL cũ
const postContentSchema = yup
  .object({
    kind: yup.string().oneOf(["text", "image"]),
    value: yup.string().when("kind", {
      is: "text",
      then: (s) =>
        s
          .trim()
          .required("Nội dung không được để trống.")
          .max(20000, "Nội dung tối đa 20000 ký tự."),
      otherwise: (s) => s.max(20000, "Nội dung tối đa 20000 ký tự."),
    }),
    file: yup.mixed().nullable(),
    preview: yup.string().nullable(),
  })
  .test(
    "image-has-content",
    "Vui lòng chọn ảnh cho khối này.",
    (b) =>
      b.kind !== "image" ||
      Boolean(b.file) ||
      Boolean((b.value ?? "").trim()),
  );

export const postCreateSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Tiêu đề không được để trống.")
    .max(200, "Tiêu đề tối đa 200 ký tự."),
  description: yup
    .string()
    .trim()
    .required("Mô tả không được để trống.")
    .max(2000, "Mô tả tối đa 2000 ký tự."),
  visibility: yup.number().oneOf([1, 2], "Phạm vi bài viết không hợp lệ."),
  contents: yup
    .array()
    .of(postContentSchema)
    .min(1, "Bài viết phải có ít nhất 1 khối nội dung."),
});

export const postUpdateSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Tiêu đề không được để trống.")
    .max(200, "Tiêu đề tối đa 200 ký tự."),
  description: yup.string().max(2000, "Mô tả tối đa 2000 ký tự."),
  visibility: yup.number().oneOf([1, 2], "Phạm vi bài viết không hợp lệ."),
  contents: yup
    .array()
    .of(postContentSchema)
    .min(1, "Danh sách nội dung không được rỗng."),
});

// ===== Product =====
const priceField = yup
  .number()
  .nullable()
  .transform((value, originalValue) =>
    originalValue === "" ? null : value,
  )
  .min(0, "Giá không được âm.")
  .typeError("Giá phải là số.");

const specValueSchema = yup.object({
  specificationId: yup.string().required(),
  value: yup.string().max(500, "Giá trị thông số tối đa 500 ký tự."),
});

const productBaseFields = {
  name: yup
    .string()
    .trim()
    .required("Tên sản phẩm không được để trống.")
    .max(200, "Tên sản phẩm tối đa 200 ký tự."),
  brand: yup
    .string()
    .trim()
    .required("Thương hiệu không được để trống.")
    .max(100, "Thương hiệu tối đa 100 ký tự."),
  categoryId: yup.string().required("Vui lòng chọn danh mục."),
  price: priceField,
  description: yup.string().max(2000, "Mô tả tối đa 2000 ký tự."),
};

// CreateProductForm (page + dialog nhúng): form luôn gửi đủ field nên 2 mode cùng rule
export const productFormSchema = yup.object({
  ...productBaseFields,
  specifications: yup.array().of(specValueSchema),
});

// ProductFormDialog (admin): mode tạo bắt buộc brand + danh mục,
// mode sửa cho để trống (gửi null nghĩa là giữ nguyên như BE)
export const productDialogCreateSchema = yup.object({
  ...productBaseFields,
  thumnailUrl: yup.string().max(2000, "URL ảnh đại diện tối đa 2000 ký tự."),
  images: yup.array().of(yup.string().max(2000, "URL ảnh tối đa 2000 ký tự.")),
});

export const productDialogUpdateSchema = yup.object({
  name: productBaseFields.name,
  brand: yup.string().max(100, "Thương hiệu tối đa 100 ký tự."),
  categoryId: yup.string(),
  price: priceField,
  description: yup.string().max(2000, "Mô tả tối đa 2000 ký tự."),
  thumnailUrl: yup.string().max(2000, "URL ảnh đại diện tối đa 2000 ký tự."),
  images: yup.array().of(yup.string().max(2000, "URL ảnh tối đa 2000 ký tự.")),
});
