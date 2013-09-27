
namespace Typer.BLL.Services
{
    public interface IUserService
    {
        bool IsAuthenticated(string username, string password);
    }
}
