using Typer.Domain.Entities;

namespace Typer.DAL.Repositories
{
    public interface IUsersRepository
    {
        User getUser(int userID);
        User getUser(string username);
        User getUser(string username, string password);
        User getUserByMail(string mail);
        bool userExists(string username);
        bool userExists(string username, string password);
        bool mailExists(string mail);
        bool addUser(User user);
        bool verifyMail(int userId);
        bool resetVerificationCode(int userId);
    }
}