using Typer.DAL.TransferObjects;

namespace Typer.DAL.Repositories
{
    public interface IUsersRepository
    {
        UserDto getUser(int userID);
        UserDto getUser(string username);
        UserDto getUser(string username, string password);
        UserDto getUserByMail(string mail);
        bool userExists(string username);
        bool userExists(string username, string password);
        bool mailExists(string mail);
        bool addUser(UserDto user);
        bool verifyMail(int userId);
        bool resetVerificationCode(int userId, string code);
        bool resetPassword(int userId, string password);
        
    }
}