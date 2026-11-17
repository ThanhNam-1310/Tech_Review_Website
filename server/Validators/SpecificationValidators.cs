using FluentValidation;
using server.Dtos.Specification;

namespace server.Validators;

public class SpecificationCreateDTOValidator : AbstractValidator<SpecificationCreateDTO>
{
    public SpecificationCreateDTOValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên thông số không được để trống.")
            .MaximumLength(100).WithMessage("Tên thông số tối đa 100 ký tự.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("CategoryId không được để trống.");
    }
}

public class SpecificationUpdateDTOValidator : AbstractValidator<SpecificationUpdateDTO>
{
    public SpecificationUpdateDTOValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên thông số không được để trống.")
            .MaximumLength(100).WithMessage("Tên thông số tối đa 100 ký tự.")
            .When(x => x.Name is not null);

        RuleFor(x => x.CategoryId)
            .Must(id => id is null || id.Value != Guid.Empty)
            .WithMessage("CategoryId không hợp lệ.");
    }
}
