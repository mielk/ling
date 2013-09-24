using System;
using System.Web.Mvc;
using System.Web.Routing;
using Ninject;
using Moq;
using Typer.Domain.Abstract;
using Typer.Domain.Entities;

namespace Typer.Web.Infrastructure
{
    public class NinjectControllerFactory : DefaultControllerFactory
    {

        private IKernel ninjectKernel;

        public NinjectControllerFactory()
        {
            ninjectKernel = new StandardKernel();
            AddBindings();
        }


        protected override IController GetControllerInstance(RequestContext requestContext, Type controllerType)
        {
            return controllerType == null ? null : (IController)ninjectKernel.Get(controllerType);
        }


        private void AddBindings()
        {

            Mock<IUsersRepository> mockedUsersRepository = new Mock<IUsersRepository>();
            mockedUsersRepository.Setup(m => m.getUser(It.IsAny<int>())).Returns(new User { UserID = 1, UserName = "test", Password = "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3" });

            ninjectKernel.Bind<IUsersRepository>().ToConstant(mockedUsersRepository.Object);

        }


    }
}