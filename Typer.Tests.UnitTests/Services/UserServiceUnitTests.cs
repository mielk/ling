using Microsoft.VisualStudio.TestTools.UnitTesting;
using Typer.DAL.Repositories;
using Typer.Domain.Entities;
using Typer.Domain.Services;
using Moq;

namespace Typer.Tests.UnitTests.Domain
{
    [TestClass]
    public class UserServiceUnitTests
    {

        private static readonly string username = "test";
        private static readonly string password = "test";
        private static readonly string passwordEncrypted = "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3";

        private UserService service;
        private UserLoginData loginData = new UserLoginData { Username = username, Password = password };
        //private IUsersRepository repository;
        


        #region TestsInitialization
        public UserServiceUnitTests()
        {
            service = new UserService(createMockRepository().Object);
        }
        private Mock<IUsersRepository> createMockRepository()
        {
            var mock = new Mock<IUsersRepository>();
            mock.Setup(m => m.userExists(loginData.Username, passwordEncrypted)).Returns(true);
            return mock;
        }
        #endregion TestsInitialization


        [TestMethod]
        public void IsAuthenticated_returns_true_for_existing_user_password_pair()
        {
            Assert.IsTrue(service.IsAuthenticated(loginData));
        }


        [TestMethod]
        public void IsAuthenticated_returns_false_for_non_existing_user_password_pair()
        {
            Assert.IsFalse(service.IsAuthenticated(new UserLoginData { Username = username, Password = password + "a" }));
        }

        [TestMethod]
        public void IsAuthenticated_returns_false_for_user_or_password_empty_or_null()
        {
            Assert.IsFalse(service.IsAuthenticated(new UserLoginData { Username = "", Password = password }));
            Assert.IsFalse(service.IsAuthenticated(new UserLoginData { Username = username, Password = "" }));
            Assert.IsFalse(service.IsAuthenticated(new UserLoginData { Username = null, Password = password }));
            Assert.IsFalse(service.IsAuthenticated(new UserLoginData { Username = username, Password = null }));
            Assert.IsFalse(service.IsAuthenticated(new UserLoginData { Username = "", Password = "" }));
            Assert.IsFalse(service.IsAuthenticated(new UserLoginData { Username = null, Password = null }));
        }

    }
}
