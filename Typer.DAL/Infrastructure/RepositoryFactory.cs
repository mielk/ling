using Typer.DAL.Repositories;

namespace Typer.DAL.Infrastructure
{
    public class RepositoryFactory
    {

        private static readonly IUsersRepository usersRepository;
        private static readonly IQuestionsRepository questionsRepository;

        static RepositoryFactory()
        {
            usersRepository = new EFUsersRepository();
            questionsRepository = new EFQuestionsRepository();
        }


        public static IUsersRepository getUsersRepository()
        {
            return usersRepository;
        }

        public static IQuestionsRepository getQuestionsRepository()
        {
            return questionsRepository;
        }


    }
}
