using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Entities;

namespace Typer.Domain.Abstract
{
    public interface IUsersRepository
    {
        IQueryable<User> Users();
        User getUser(int userID);
        User getUser(string username, string password);
        int getUsersCount();
    }
}