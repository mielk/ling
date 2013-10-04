using Typer.DAL.Repositories;
using Typer.DAL.Infrastructure;
using Typer.Common.Helpers;
using Typer.Domain.Entities;

namespace Typer.BLL.Services
{
    public class UserService : IUserService
    {

        private readonly IUsersRepository repository;

        public UserService(IUsersRepository repository)
        {
            if (repository == null)
            {
                this.repository = RepositoryFactory.getUsersRepository();
            }
            else
            {
                this.repository = repository;
            }
        }

        public bool IsAuthenticated(UserLoginData loginData)
        {
            return repository.userExists(loginData.Username, SHA1.Encode(loginData.Password));
    }

        public bool addUser(UserRegistrationData userData)
        {
            User user = userData.toUser();
            user.IsActive = false;
            repository.addUser(user);
            return false;
        }

        public bool userExists(string username)
        {
            return (repository.userExists(username));
        }

    }
}