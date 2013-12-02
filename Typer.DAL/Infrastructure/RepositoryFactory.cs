using Typer.DAL.Repositories;

namespace Typer.DAL.Infrastructure
{
    public class RepositoryFactory
    {

        private static readonly IUsersRepository usersRepository;
        private static readonly IQuestionsRepository questionsRepository;
        private static readonly ILanguageRepository languageRepository;
        private static readonly IWordsRepository wordsRepository;

        static RepositoryFactory()
        {
            usersRepository = new EFUsersRepository();
            questionsRepository = new EFQuestionsRepository();
            languageRepository = new EFLanguageRepository();
            wordsRepository = new EFWordsRepository();
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

        public static IWordsRepository getWordsRepository()
        {
            return wordsRepository;
        }

    }
}
