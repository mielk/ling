using Ninject;

namespace Typer.DAL.Repositories
{
    public class UsersRepositoryFactory
    {

        public static readonly UsersRepositoryFactory instance = new UsersRepositoryFactory();

        [Inject]
        public IUsersRepository Repository { get; private set; }

    }
}