using Typer.DAL.TransferObjects;

// ReSharper disable once CheckNamespace
namespace Typer.DAL.Repositories
{
    public interface IUsersRepository
    {
        UserDto GetUser(int userID);
        UserDto GetUser(string username);
        UserDto GetUser(string username, string password);
        UserDto GetUserByMail(string mail);
        bool UserExists(string username);
        bool UserExists(string username, string password);
        bool MailExists(string mail);
        bool AddUser(UserDto user);
        bool VerifyMail(int userId);
        bool ResetVerificationCode(int userId, string code);
        bool ResetPassword(int userId, string password);
        
    }
}