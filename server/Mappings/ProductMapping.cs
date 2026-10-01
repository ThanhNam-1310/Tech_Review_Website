using AutoMapper;
using server.Dtos.Products;
using server.Models;

namespace server.Mappings
{
    public class ProductMapping: Profile
    {
        public ProductMapping()
        {
            CreateMap<Product, ProductDTO>();
            CreateMap<Product, ListProductDTO>();
            CreateMap<Product_Specification, Product_SpecificationDTO>();
            CreateMap<CreateProductDTO, Product>();
        }
    }
}
