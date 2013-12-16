using Microsoft.VisualStudio.TestTools.UnitTesting;
using Typer.DAL.Repositories;
using Typer.Domain.Entities;
using Typer.Domain.Services;
using Moq;

// ReSharper disable once CheckNamespace
namespace Typer.Tests.UnitTests.Domain
{
    [TestClass]
    public class UserServiceUnitTests
    {
        private const string Username = "test";
        private const string Password = "test";
        private const string PasswordEncrypted = "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3";

        private readonly UserService _service;
        private readonly UserLoginData _loginData = new UserLoginData { Username = Username, Password = Password };
        //private IUsersRepository repository;
        


        #region TestsInitialization
        public UserServiceUnitTests()
        {
            _service = new UserService(CreateMockRepository().Object);
        }
        private Mock<IUsersRepository> CreateMockRepository()
        {
            var mock = new Mock<IUsersRepository>();
            mock.Setup(m => m.UserExists(_loginData.Username, PasswordEncrypted)).Returns(true);
            return mock;
        }
        #endregion TestsInitialization


        [TestMethod]
        public void IsAuthenticated_returns_true_for_existing_user_password_pair()
        {
            Assert.IsTrue(_service.IsAuthenticated(_loginData));
        }


        [TestMethod]
        public void IsAuthenticated_returns_false_for_non_existing_user_password_pair()
        {
            Assert.IsFalse(_service.IsAuthenticated(new UserLoginData { Username = Username, Password = Password + "a" }));
        }

        [TestMethod]
        public void IsAuthenticated_returns_false_for_user_or_password_empty_or_null()
        {
            Assert.IsFalse(_service.IsAuthenticated(new UserLoginData { Username = "", Password = Password }));
            Assert.IsFalse(_service.IsAuthenticated(new UserLoginData { Username = Username, Password = "" }));
            Assert.IsFalse(_service.IsAuthenticated(new UserLoginData { Username = null, Password = Password }));
            Assert.IsFalse(_service.IsAuthenticated(new UserLoginData { Username = Username, Password = null }));
            Assert.IsFalse(_service.IsAuthenticated(new UserLoginData { Username = "", Password = "" }));
            Assert.IsFalse(_service.IsAuthenticated(new UserLoginData { Username = null, Password = null }));
        }

    }
}
