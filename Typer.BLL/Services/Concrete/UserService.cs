using Typer.DAL.Repositories;
using Typer.Domain.Helpers;
using Typer.Domain.Entities;

namespace Typer.BLL.Services
{
    public class UserService : IUserService
    {

        private readonly IUsersRepository repository;

        public UserService(IUsersRepository repository)
        {
            this.repository = repository;
        }


        public bool IsAuthenticated(UserLoginData loginData)
        {
            return repository.userExists(loginData.Username, SHA1.Encode(loginData.Password));
        }

    }
}