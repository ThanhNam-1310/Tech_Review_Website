using FluentValidation;
using server.Dtos.Specification;

namespace server.Common.Validations
{
    public class SpecificationValidation: AbstractValidator<SpecificationUpdateDTO>
    {
        public SpecificationValidation()
        {

        }
    }
}
