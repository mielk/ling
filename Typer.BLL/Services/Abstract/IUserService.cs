using Typer.Domain.Entities;

namespace Typer.BLL.Services
{
    public interface IUserService
    {
        bool IsAuthenticated(UserLoginData loginData);
        bool addUser(UserRegistrationData userData);
    }
}
