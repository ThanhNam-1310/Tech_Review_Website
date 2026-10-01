namespace server.Common.Exceptions
{
    public class ConflictCustomException: BaseException
    {
        public ConflictCustomException(string message): base(message, StatusCodes.Status409Conflict) { }
    }
}
