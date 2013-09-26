using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.BLL.Services
{
    public class IUserService
    {
        bool IsAuthenticated(string username, string password);
    }
}
