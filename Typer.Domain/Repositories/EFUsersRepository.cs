using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Abstract;
using Typer.Domain.Entities;
using Typer.Domain.Concrete;

namespace Typer.Domain.Repositories
{
    public class EFUsersRepository : IUsersRepository
    {

        private EFDbContext context = new EFDbContext();
        private User currentUser;


        //------------


        public User getUser(int userID)
        {
            return context.Users.Single(u => u.UserID == userID);
        }


        public bool logUser(string username, string password)
        {
            User user = getUser(username, password);
            if (user != null)
            {
                setCurrentUser(user);
                return true;
            }
            else
            {
                return false;
            }

        }

        private User getUser(string username, string password)
        {
            return context.Users.SingleOrDefault(u => u.UserName == username && u.Password == password);
        }



        public void setCurrentUser(User user)
        {
            currentUser = user;
        }

        public User getCurrentUser()
        {
            return currentUser;
        }

    }
}