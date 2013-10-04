using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ninject;

namespace Typer.BLL.Services
{
    public static class ServicesFactory
    {

        [Inject]
        private static readonly IUserService userService;



        public static IUserService getUserService()
        {
            return userService;
        }


    }
}
