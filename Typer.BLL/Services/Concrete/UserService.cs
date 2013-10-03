using Typer.DAL.Repositories;
using Typer.Common.Helpers;
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

        public bool addUser(UserRegistrationData userData)
        {
            User user = userData.toUser();
            user.IsActive = false;
            repository.addUser(user);
            return false;
        }

    }
}