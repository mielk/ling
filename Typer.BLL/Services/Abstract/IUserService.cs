using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.BLL.Services
{
    public interface IUserService
    {
        bool IsAuthenticated(string username, string password);
    }
}
