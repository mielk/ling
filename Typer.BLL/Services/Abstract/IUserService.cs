namespace Typer.BLL.Services
{
    public interface IUserService
    {
        bool IsAuthenticated(UserLoginData loginData);
    }
}
