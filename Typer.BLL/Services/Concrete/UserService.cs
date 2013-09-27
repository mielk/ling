using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Repositories;

namespace Typer.BLL.Services
{
    public class UserService : IUserService
    {

        public bool IsAuthenticated(string username, string password)
        {
            return false;
        }

    }
}