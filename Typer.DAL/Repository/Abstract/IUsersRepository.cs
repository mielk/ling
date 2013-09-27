using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Entities;

namespace Typer.DAL.Repositories
{
    public interface IUsersRepository
    {
        User getUser(int userID);
        bool userExists(string username, string password);
    }
}