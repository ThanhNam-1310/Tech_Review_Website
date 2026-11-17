using FluentValidation;
using server.Dtos.Category;

namespace server.Validators;

public class CreateCategoryDTOValidator : AbstractValidator<CreateCategoryDTO>
{
    public CreateCategoryDTOValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên danh mục không được để trống.")
            .MaximumLength(100).WithMessage("Tên danh mục tối đa 100 ký tự.");

        RuleFor(x => x.ParentId)
            .Must(id => id is null || id.Value != Guid.Empty)
            .WithMessage("ParentId không hợp lệ.");
    }
}

public class UpdateCategoryDTOValidator : AbstractValidator<UpdateCategoryDTO>
{
    public UpdateCategoryDTOValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên danh mục không được để trống.")
            .MaximumLength(100).WithMessage("Tên danh mục tối đa 100 ký tự.");

        RuleFor(x => x.ParentId)
            .Must(id => id is null || id.Value != Guid.Empty)
            .WithMessage("ParentId không hợp lệ.");
    }
}
