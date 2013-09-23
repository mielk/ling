using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Typer.Web.Controllers;
using Typer.Domain.Abstract;
using Typer.Domain.Entities;
using Moq;

namespace Typer.Tests.UnitTests.Controllers
{
    [TestClass]
    public class LoginControllerUnitTests
    {

        private LoginController controller;


        public LoginControllerUnitTests()
        {
            Mock<IUsersRepository> mockedUsersRepository = new Mock<IUsersRepository>();
            mockedUsersRepository.Setup(m => m.getUser(It.IsAny<int>())).Returns(new User { UserID = 1, UserName = "test", Password = "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3" });
            mockedUsersRepository.Setup(m => m.getUser(It.IsAny<string>(), "test")).Returns(new User { UserID = 1, UserName = "test", Password = "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3" });
            mockedUsersRepository.Setup(m => m.getUser(It.IsAny<string>(), It.IsNotIn("test"))).Returns((User)null);
            
            controller = new LoginController(mockedUsersRepository.Object);

        }

    }
}
