using Typer.DAL.Repositories;

namespace Typer.DAL.Infrastructure
{
    public class RepositoryFactory
    {

        private static readonly IUsersRepository usersRepository;
        private static readonly IQuestionsRepository questionsRepository;
        private static readonly ILanguageRepository languageRepository;

        static RepositoryFactory()
        {
            usersRepository = new EFUsersRepository();
            questionsRepository = new EFQuestionsRepository();
            languageRepository = new EFLanguageRepository();
        }


        public static IUsersRepository getUsersRepository()
        {
            return usersRepository;
        }

        public static IQuestionsRepository getQuestionsRepository()
        {
            return questionsRepository;
        }

        public static ILanguageRepository getLanguageRepository()
        {
            return languageRepository;
        }

    }
}
