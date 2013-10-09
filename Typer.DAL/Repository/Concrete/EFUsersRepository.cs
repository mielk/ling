using System.Linq;
using Typer.Domain.Entities;
using Typer.DAL.Infrastructure;

namespace Typer.DAL.Repositories
{
    public class EFUsersRepository : IUsersRepository
    {

        private static readonly EFDbContext context = EFDbContext.getInstance();




        public User getUser(int userID)
        {
            return context.Users.Single(u => u.UserID == userID);
        }

        public User getUser(string username)
        {
            return context.Users.SingleOrDefault(u => u.UserName == username);
        }

        public User getUser(string username, string password)
        {
            return context.Users.SingleOrDefault(u => u.UserName == username && u.Password == password && u.IsActive == true);
        }

        public User getUserByMail(string mail)
        {
            return context.Users.SingleOrDefault(u => u.Email == mail);
        }




        public bool userExists(string username)
        {
            User user = getUser(username);
            return (user != null);
        }

        public bool userExists(string username, string password)
        {
            User user = getUser(username, password);
            return (user != null);
        }

        public bool mailExists(string mail)
        {
            int records = context.Users.Count(u => u.Email == mail);
            return (records > 0 ? true : false);
        }

        public bool addUser(User user)
        {
            context.Users.Add(user);
            context.SaveChanges();
            return false;
        }



    }
}