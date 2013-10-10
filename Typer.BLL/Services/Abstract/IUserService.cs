using Typer.Domain.Entities;

namespace Typer.BLL.Services
{
    public interface IUserService
    {
        User getUser(UserLoginData loginData);
        User getUserByName(string username);
        User getUserByMail(string mail);
        bool IsAuthenticated(UserLoginData loginData);
        bool addUser(User user);
        bool userExists(string username);
        bool mailExists(string mail);
        bool verifyMail(int userId);
        bool resetVerificationCode(int userId);
    }
}
