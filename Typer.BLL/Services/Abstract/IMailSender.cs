using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.BLL.Services
{
    public interface IMailSender
    {
        bool Send(string from, string to, string subject, string body);
        bool Send(string to, string subject, string body);
    }
}
