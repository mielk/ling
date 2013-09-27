using Typer.DAL.Repositories;
using Typer.Domain.Helpers;

namespace Typer.BLL.Services
{
    public class UserService : IUserService
    {

        private readonly IUsersRepository repository;

        public UserService(IUsersRepository repository)
        {
            this.repository = repository;
        }


        public bool IsAuthenticated(string username, string password)
        {
            return repository.userExists(username, SHA1.Encode(password));
        }

    }
}