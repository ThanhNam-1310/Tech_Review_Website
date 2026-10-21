using AutoMapper;
using server.Dtos.Products;
using server.Models;

namespace server.Mappings
{
    public class ProductMapping: Profile
    {
        public ProductMapping()
        {
            CreateMap<Product, ProductDTO>()
                .ForMember(
                    dest => dest.ThumnailUrl,
                    opt => opt.MapFrom(src => src.ThumnaiUrl))
                .ForMember(
                    dest => dest.Images,
                    opt => opt.MapFrom(src => src.ProductImagesUrl))
                .ForMember(
                    dest => dest.CreatedDate,
                    opt => opt.MapFrom(src => src.CreatedAt))
                .ForMember(
                    dest => dest.UpdatedDate,
                    opt => opt.MapFrom(src => src.UpdatedAt))
                .ForMember(
                    dest => dest.Specifications,
                    opt => opt.MapFrom(src => src.Specifications));

            CreateMap<Product_Specification, Product_SpecificationDTO>()
                .ForMember(
                    dest => dest.SpecificationId,
                    opt => opt.MapFrom(src => src.SpecificationId))
                .ForMember(
                    dest => dest.Value,
                    opt => opt.MapFrom(src => src.Value))
                .ForMember(
                    dest => dest.Name,
                    opt => opt.Ignore());

            CreateMap<Product, ListProductDTO>()
                .ForMember(
                    dest => dest.ThumnailUrl,
                    opt => opt.MapFrom(src => src.ThumnaiUrl));

            CreateMap<CreateProductDTO, Product>()
                .ForMember(dest => dest.ThumnaiUrl, opt => opt.Ignore())
                .ForMember(dest => dest.ProductImagesUrl, opt => opt.Ignore());
        }
    }
}
