using Typer.Domain.Entities;

// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public interface IUserService
    {
        User GetUser(UserLoginData loginData);
        User GetUserByName(string username);
        User GetUserByMail(string mail);
        bool IsAuthenticated(UserLoginData loginData);
        bool AddUser(User user);
        bool UserExists(string username);
        bool MailExists(string mail);
        bool VerifyMail(int userId);
        bool ResetVerificationCode(int userId);
        bool ResetPassword(User user, string password);
    }
}
