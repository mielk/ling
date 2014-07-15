// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public class UserServicesFactory
    {

        private static UserServicesFactory _instance;

        private readonly IUserService userService;



        private UserServicesFactory()
        {
            userService = new UserService(null);
        }


        public static UserServicesFactory Instance()
        {
            return _instance ?? (_instance = new UserServicesFactory());
        }


        public IUserService GetUserService()
        {
            return userService;
        }


    }
}