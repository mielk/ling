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
        User getUser(int userID);
        bool logUser(string username, string password);
        void setCurrentUser(User user);
        User getCurrentUser();
    }
}