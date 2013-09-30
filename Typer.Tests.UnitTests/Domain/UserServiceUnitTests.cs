using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Typer.BLL.Services;
using Typer.DAL.Repositories;
using Moq;

namespace Typer.Tests.UnitTests.Domain
{
    [TestClass]
    public class UserServiceUnitTests
    {

        private UserService service;
        //private IUsersRepository repository;
        private static readonly string testUserName = "test";
        private static readonly string testPasswordPlain = "test";
        private static readonly string testPasswordEncrypted = "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3";


        #region TestsInitialization
        public UserServiceUnitTests()
        {
            service = new UserService(createMockRepository().Object);
        }
        private Mock<IUsersRepository> createMockRepository()
        {
            Mock<IUsersRepository> mock = new Mock<IUsersRepository>();
            mock.Setup(m => m.userExists(testUserName, testPasswordEncrypted)).Returns(true);
            return mock;
        }
        #endregion TestsInitialization


        [TestMethod]
        public void IsAuthenticated_returns_true_for_existing_user_password_pair()
        {
            Assert.IsTrue(service.IsAuthenticated(testUserName, testPasswordPlain));
        }


        [TestMethod]
        public void IsAuthenticated_returns_false_for_non_existing_user_password_pair()
        {
            Assert.IsFalse(service.IsAuthenticated(testUserName, testPasswordPlain + "a"));
        }

        [TestMethod]
        public void IsAuthenticated_returns_false_for_user_or_password_empty_or_null()
        {
            Assert.IsFalse(service.IsAuthenticated("", testPasswordPlain));
            Assert.IsFalse(service.IsAuthenticated(testUserName, ""));
            Assert.IsFalse(service.IsAuthenticated(null, testPasswordPlain));
            Assert.IsFalse(service.IsAuthenticated(testUserName, null));
            Assert.IsFalse(service.IsAuthenticated("", ""));
            Assert.IsFalse(service.IsAuthenticated(null, null));
        }

    }
}
