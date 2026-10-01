namespace server.Common.Exceptions
{
    public class NotFoundExcception: BaseException
    {
        public NotFoundExcception(string message) : base(message, StatusCodes.Status404NotFound)
        {

        }
    }
}
