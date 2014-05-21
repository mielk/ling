using System.Diagnostics.CodeAnalysis;
using Ninject;
using Typer.DAL.Repositories;
using Typer.Domain.Services;

// ReSharper disable once CheckNamespace
namespace Typer.Web
{
    // registration code moved here for better separation of concerns
    public static partial class NinjectWebCommon
    {
        /// <summary>
        /// Load your modules or register your services here!
        /// </summary>
        /// <param name="kernel">The kernel.</param>
        [SuppressMessage("Microsoft.Maintainability", "CA1506:AvoidExcessiveClassCoupling", Justification = "IOC registration method")]
        private static void RegisterServices(IKernel kernel)
        {
            kernel.Bind<IUserService>().To<UserService>();
            kernel.Bind<IUsersRepository>().To<EFUsersRepository>();
            kernel.Bind<IQuestionService>().To<QuestionService>();
            kernel.Bind<IQuestionsRepository>().To<EFQuestionsRepository>();
            kernel.Bind<ILanguageService>().To<LanguageService>();
            kernel.Bind<ILanguageRepository>().To<EFLanguageRepository>();
            kernel.Bind<IWordService>().To<WordService>();
            kernel.Bind<IWordsRepository>().To<EfWordsRepository>();
            kernel.Bind<IGrammarService>().To<GrammarService>();
            kernel.Bind<IGrammarRepository>().To<EfGrammarRepository>();
            kernel.Bind<ICategoryRepository>().To<EfCategoriesRepository>();
            kernel.Bind<ICategoryService>().To<CategoryService>();
            kernel.Bind<IMailSender>().To<MailSender>();
        }


    }


}