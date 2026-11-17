using FluentValidation;
using server.Dtos.Comment;

namespace server.Validators;

public class CreateCommentDTOValidator : AbstractValidator<CreateCommentDTO>
{
    public CreateCommentDTOValidator()
    {
        RuleFor(x => x.CommentContent)
            .NotEmpty().WithMessage("Nội dung bình luận không được để trống.")
            .MaximumLength(2000).WithMessage("Bình luận tối đa 2000 ký tự.");

        RuleFor(x => x.ParentCommentId)
            .Must(id => id is null || id.Value != Guid.Empty)
            .WithMessage("ParentCommentId không hợp lệ.");
    }
}

public class UpdateCommentDTOValidator : AbstractValidator<UpdateCommentDTO>
{
    public UpdateCommentDTOValidator()
    {
        RuleFor(x => x.CommentContent)
            .NotEmpty().WithMessage("Nội dung bình luận không được để trống.")
            .MaximumLength(2000).WithMessage("Bình luận tối đa 2000 ký tự.");
    }
}
