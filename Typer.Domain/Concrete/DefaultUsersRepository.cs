using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Abstract;
using Typer.Domain.Entities;

namespace Typer.Domain.Concrete
{
    public class DefaultUsersRepository : IUsersRepository
    {

        private static IUsersRepository instance;
        private static List<User> users;



        private DefaultUsersRepository(){
            users = new List<User>();
            users.Add(new User { UserID = 1, UserName = "test", Password = "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3" });
            users.Add(new User { UserID = 2, UserName = "test2", Password = "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3" });
            users.Add(new User { UserID = 3, UserName = "test3", Password = "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3" });
        }

        public static IUsersRepository getInstance()
        {
            if (instance == null)
            {
                instance = new DefaultUsersRepository();
            }

            return instance;

        }


        //--------------
        public User getUser(int userID)
        {
            return users.Single(u => u.UserID == userID);
        }

        public User getUser(string username, string password)
        {
            return users.Single(u => u.UserName == username && u.Password == password);
        }


    }
}
