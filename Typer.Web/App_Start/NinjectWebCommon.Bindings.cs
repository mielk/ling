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
            kernel.Bind<IQuestionsRepository>().To<EFQuestionsRepository>();
            //kernel.Bind<IQuestionsRepository>().ToConstant(createMockQuestionsRepository());
            kernel.Bind<IMailSender>().To<MailSender>();
        }

        private static IQuestionsRepository createMockQuestionsRepository()
        {
            Mock<IQuestionsRepository> mock = new Mock<IQuestionsRepository>();
            mock.Setup(m => m.getQuestions()).Returns(new List<Question> {
                new Question { Id = 1, Name = "test1", Weight = 1, IsActive = true },
                new Question { Id = 2, Name = "test2", Weight = 2, IsActive = false },
                new Question { Id = 3, Name = "test3", Weight = 3, IsActive = false },
                new Question { Id = 4, Name = "test4", Weight = 4, IsActive = false },
                new Question { Id = 5, Name = "test5", Weight = 5, IsActive = true },
                new Question { Id = 6, Name = "test6", Weight = 6, IsActive = true },
                new Question { Id = 7, Name = "test7", Weight = 7, IsActive = true },
                new Question { Id = 8, Name = "test8", Weight = 8, IsActive = true },
                new Question { Id = 9, Name = "test9", Weight = 9, IsActive = true },
                new Question { Id = 10, Name = "test10", Weight = 10, IsActive = true },
                new Question { Id = 11, Name = "test11", Weight = 1, IsActive = true },
                new Question { Id = 12, Name = "test12", Weight = 2, IsActive = true },
                new Question { Id = 13, Name = "test13", Weight = 3, IsActive = true },
                new Question { Id = 14, Name = "test14", Weight = 4, IsActive = true },
                new Question { Id = 15, Name = "test15", Weight = 5, IsActive = true },
                new Question { Id = 16, Name = "test16", Weight = 6, IsActive = true },
                new Question { Id = 17, Name = "test17", Weight = 7, IsActive = true },
                new Question { Id = 18, Name = "test18", Weight = 8, IsActive = true },
                new Question { Id = 19, Name = "test19", Weight = 9, IsActive = true },
                new Question { Id = 20, Name = "test20", Weight = 10, IsActive = true }
            });
            return mock.Object;
        }


    }


}