namespace server.Common.Exceptions
{
    public class ForbiddenException :BaseException
    {
        public ForbiddenException(string message) : base(message, StatusCodes.Status403Forbidden) { }
    }
}
