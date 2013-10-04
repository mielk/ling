using Typer.DAL.Repositories;

namespace Typer.DAL.Infrastructure
{
    public class RepositoryFactory
    {

        private static readonly IUsersRepository usersRepository;

        static RepositoryFactory()
        {
            usersRepository = new EFUsersRepository();
        }


        public static IUsersRepository getUsersRepository()
        {
            return usersRepository;
        }


    }
}
