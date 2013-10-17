using Ninject;
using Typer.DAL.Repositories;
using Typer.BLL.Services;


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
            kernel.Bind<IQuestionsRepository>().To<EFQuestionsRepository>();
            kernel.Bind<IMailSender>().To<MailSender>();
        }
    }
}