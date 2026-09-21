import ProductReview from "@/components/sections/ProductReview";
import React from "react";
import { categories, products } from "@/utils/demo/data";

const HomePage = () => {
  return (
    <div>
      {/* Các section của home */}
      <ProductReview
        categories={categories}
        products={products}
        currentPage={1}
        totalPages={1}
      />
    </div>
  );
};

export default HomePage;
