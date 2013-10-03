using Typer.Domain.Entities;

namespace Typer.DAL.Repositories
{
    public interface IUsersRepository
    {
        User getUser(int userID);
        bool userExists(string username, string password);
        bool addUser(User user);
    }
}