using FluentValidation;
using server.Dtos.Products;

namespace server.Validators;

public class CreateProductSpecificationDTOValidator : AbstractValidator<CreateProductSpecificationDTO>
{
    public CreateProductSpecificationDTOValidator()
    {
        RuleFor(x => x.SpecificationId)
            .NotEmpty().WithMessage("SpecificationId không được để trống.");

        RuleFor(x => x.Value)
            .NotEmpty().WithMessage("Giá trị thông số không được để trống.")
            .MaximumLength(500).WithMessage("Giá trị thông số tối đa 500 ký tự.");
    }
}

public class Product_SpecificationDTOValidator : AbstractValidator<Product_SpecificationDTO>
{
    public Product_SpecificationDTOValidator()
    {
        RuleFor(x => x.SpecificationId)
            .NotEmpty().WithMessage("SpecificationId không được để trống.");

        RuleFor(x => x.Value)
            .MaximumLength(500).WithMessage("Giá trị thông số tối đa 500 ký tự.");
    }
}

public class CreateProductDTOValidator : AbstractValidator<CreateProductDTO>
{
    public CreateProductDTOValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên sản phẩm không được để trống.")
            .MaximumLength(200).WithMessage("Tên sản phẩm tối đa 200 ký tự.");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Mô tả tối đa 2000 ký tự.");

        RuleFor(x => x.Brand)
            .NotEmpty().WithMessage("Thương hiệu không được để trống.")
            .MaximumLength(100).WithMessage("Thương hiệu tối đa 100 ký tự.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("CategoryId không được để trống.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0m).When(x => x.Price.HasValue)
            .WithMessage("Giá không được âm.");

        RuleFor(x => x.Specifications)
            .Must(specs => specs.Select(s => s.SpecificationId).Distinct().Count() == specs.Count)
            .WithMessage("Danh sách thông số không được trùng SpecificationId.");

        RuleForEach(x => x.Specifications)
            .SetValidator(new CreateProductSpecificationDTOValidator());
    }
}

public class UpdateProductDTOValidator : AbstractValidator<UpdateProductDTO>
{
    public UpdateProductDTOValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên sản phẩm không được để trống.")
            .MaximumLength(200).WithMessage("Tên sản phẩm tối đa 200 ký tự.")
            .When(x => x.Name is not null);

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Mô tả tối đa 2000 ký tự.");

        RuleFor(x => x.Brand)
            .NotEmpty().WithMessage("Thương hiệu không được để trống.")
            .MaximumLength(100).WithMessage("Thương hiệu tối đa 100 ký tự.")
            .When(x => x.Brand is not null);

        RuleFor(x => x.CategoryId)
            .Must(id => id is null || id.Value != Guid.Empty)
            .WithMessage("CategoryId không hợp lệ.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0m).When(x => x.Price.HasValue)
            .WithMessage("Giá không được âm.");

        RuleFor(x => x.ThumnailUrl)
            .MaximumLength(2000).WithMessage("URL ảnh đại diện tối đa 2000 ký tự.");

        RuleForEach(x => x.Images!)
            .NotEmpty().WithMessage("URL ảnh không được để trống.")
            .MaximumLength(2000).WithMessage("URL ảnh tối đa 2000 ký tự.");

        RuleFor(x => x.Specifications)
            .Must(specs => specs is null || specs.Select(s => s.SpecificationId).Distinct().Count() == specs.Count)
            .WithMessage("Danh sách thông số không được trùng SpecificationId.");

        RuleForEach(x => x.Specifications!)
            .SetValidator(new Product_SpecificationDTOValidator());
    }
}
