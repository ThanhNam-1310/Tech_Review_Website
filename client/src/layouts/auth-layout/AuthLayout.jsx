import React from "react";

import defaultImgBack from "../../assets/img-background.jpg";

const AuthLayout = ({
  children,
  imageSrc,
  imageAlt = "Authentication background",
  defaultImg = defaultImgBack,
  isRegister = false,
}) => {
  const finalImage = imageSrc || defaultImg;

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-[#f5f0e8]">
      {/* ========== IMAGE - chỉ hiện trên desktop ========== */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <img
          src={finalImage}
          alt={imageAlt}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
        />
      </div>

      {/* ========== FORM ========== */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-lg">
          {!isRegister && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>

              <p className="mt-2 text-gray-600">
                Đăng nhập hoặc tạo tài khoản để tiếp tục.
              </p>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
