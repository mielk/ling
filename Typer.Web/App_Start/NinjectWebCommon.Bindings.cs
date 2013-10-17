using Ninject;
using Typer.DAL.Repositories;
using Typer.BLL.Services;
using Moq;
using Typer.Domain.Entities;
using System.Collections.Generic;

namespace Typer.Web
{
    // registration code moved here for better separation of concerns
    public static partial class NinjectWebCommon
    {
        /// <summary>
        /// Load your modules or register your services here!
        /// </summary>
        /// <param name="kernel">The kernel.</param>
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Maintainability", "CA1506:AvoidExcessiveClassCoupling", Justification = "IOC registration method")]
        private static void RegisterServices(IKernel kernel)
        {
            kernel.Bind<IUserService>().To<UserService>();
            kernel.Bind<IUsersRepository>().To<EFUsersRepository>();
            kernel.Bind<IQuestionService>().To<QuestionService>();
            //kernel.Bind<IQuestionsRepository>().To<EFQuestionsRepository>();
            kernel.Bind<IQuestionsRepository>().ToConstant(createMockQuestionsRepository());
            kernel.Bind<IMailSender>().To<MailSender>();
        }

        private static IQuestionsRepository createMockQuestionsRepository()
        {
            Mock<IQuestionsRepository> mock = new Mock<IQuestionsRepository>();
            mock.Setup(m => m.getQuestions()).Returns(new List<Question> {
                new Question { Name = "test1", Weight = 1, IsActive = true },
                new Question { Name = "test2", Weight = 2, IsActive = false },
                new Question { Name = "test3", Weight = 3, IsActive = false },
                new Question { Name = "test4", Weight = 4, IsActive = false },
                new Question { Name = "test5", Weight = 5, IsActive = true },
                new Question { Name = "test6", Weight = 6 },
                new Question { Name = "test7", Weight = 7 },
                new Question { Name = "test8", Weight = 8 },
                new Question { Name = "test9", Weight = 9 },
                new Question { Name = "test10", Weight = 10 },
                new Question { Name = "test11", Weight = 1 },
                new Question { Name = "test12", Weight = 2 },
                new Question { Name = "test13", Weight = 3 },
                new Question { Name = "test14", Weight = 4 },
                new Question { Name = "test15", Weight = 5 },
                new Question { Name = "test16", Weight = 6 },
                new Question { Name = "test17", Weight = 7 },
                new Question { Name = "test18", Weight = 8 },
                new Question { Name = "test19", Weight = 9 },
                new Question { Name = "test20", Weight = 10 }
            });
            return mock.Object;
        }


    }


}