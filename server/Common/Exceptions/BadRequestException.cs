namespace server.Common.Exceptions
{
    public class BadRequestException: BaseException
    {
        public BadRequestException(string message): base(message, StatusCodes.Status400BadRequest) { }
    }
}
