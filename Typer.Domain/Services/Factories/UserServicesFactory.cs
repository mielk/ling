using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            if (_instance == null)
            {
                _instance = new UserServicesFactory();
            }

            return _instance;

        }


        public IUserService getUserService()
        {
            return userService;
        }


    }
}