using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.Domain.Services
{
    public class IUserServices
    {
        bool Authentication(string username, string password);
    }
}
