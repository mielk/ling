using System.Linq;
using Typer.Domain.Entities;
using Typer.DAL.Infrastructure;

namespace Typer.DAL.Repositories
{
    public class EFUsersRepository : IUsersRepository
    {

        private EFDbContext context = new EFDbContext();




        public User getUser(int userID)
        {
            return context.Users.Single(u => u.UserID == userID);
        }

        private User getUser(string username, string password)
        {
            return context.Users.SingleOrDefault(u => u.UserName == username && u.Password == password);
        }




        public bool userExists(string username, string password)
        {
            User user = getUser(username, password);
            return (user != null);
        }





    }
}