using FluentValidation;
using server.Common.Enums;
using server.Dtos.PostContents;
using server.Dtos.Posts;

namespace server.Validators;

public class CreatePostContentDTOValidator : AbstractValidator<CreatePostContentDTO>
{
    public CreatePostContentDTOValidator()
    {
        RuleFor(x => x.PostContentType)
            .IsInEnum().WithMessage("Loại nội dung không hợp lệ.");

        RuleFor(x => x.ValueContent)
            .MaximumLength(20000).WithMessage("Nội dung tối đa 20000 ký tự.");

        // Khối ảnh lúc tạo chưa có URL (URL chỉ có sau bước upload) nên chỉ bắt
        // buộc không rỗng với khối văn bản
        RuleFor(x => x.ValueContent)
            .NotEmpty().When(x => x.PostContentType == PostContentType.Text)
            .WithMessage("Nội dung không được để trống.");
    }
}

public class UpdatePostContentDTOValidator : AbstractValidator<UpdatePostContentDTO>
{
    public UpdatePostContentDTOValidator()
    {
        RuleFor(x => x.PostContentType)
            .IsInEnum().WithMessage("Loại nội dung không hợp lệ.");

        RuleFor(x => x.ValueContent)
            .MaximumLength(20000).WithMessage("Nội dung tối đa 20000 ký tự.");

        RuleFor(x => x.ValueContent)
            .NotEmpty().When(x => x.ValueContent is not null)
            .WithMessage("Nội dung không được để trống.");
    }
}

public class CreatePostDTOValidator : AbstractValidator<CreatePostDTO>
{
    public CreatePostDTOValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tiêu đề không được để trống.")
            .MaximumLength(200).WithMessage("Tiêu đề tối đa 200 ký tự.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Mô tả không được để trống.")
            .MaximumLength(2000).WithMessage("Mô tả tối đa 2000 ký tự.");

        RuleFor(x => x.ProductId)
            .Must(id => id is null || id.Value != Guid.Empty)
            .WithMessage("ProductId không hợp lệ.");

        RuleFor(x => x.CategoryId)
            .Must(id => id is null || id.Value != Guid.Empty)
            .WithMessage("CategoryId không hợp lệ.");

        RuleFor(x => x.Visibility)
            .IsInEnum().WithMessage("Phạm vi bài viết không hợp lệ.");

        RuleFor(x => x.Contents)
            .NotEmpty().WithMessage("Bài viết phải có ít nhất 1 khối nội dung.");

        RuleForEach(x => x.Contents)
            .SetValidator(new CreatePostContentDTOValidator());
    }
}

public class UpdatePostDTOValidator : AbstractValidator<UpdatePostDTO>
{
    public UpdatePostDTOValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tiêu đề không được để trống.")
            .MaximumLength(200).WithMessage("Tiêu đề tối đa 200 ký tự.")
            .When(x => x.Title is not null);

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Mô tả tối đa 2000 ký tự.");

        RuleFor(x => x.ProductId)
            .Must(id => id is null || id.Value != Guid.Empty)
            .WithMessage("ProductId không hợp lệ.");

        RuleFor(x => x.CategoryId)
            .Must(id => id is null || id.Value != Guid.Empty)
            .WithMessage("CategoryId không hợp lệ.");

        RuleFor(x => x.Visibility)
            .IsInEnum().When(x => x.Visibility.HasValue)
            .WithMessage("Phạm vi bài viết không hợp lệ.");

        RuleFor(x => x.Contents)
            .NotEmpty().When(x => x.Contents is not null)
            .WithMessage("Danh sách nội dung không được rỗng.");

        RuleForEach(x => x.Contents!)
            .SetValidator(new UpdatePostContentDTOValidator());
    }
}
