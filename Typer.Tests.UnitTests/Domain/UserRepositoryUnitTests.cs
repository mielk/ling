using Microsoft.VisualStudio.TestTools.UnitTesting;
using Typer.DAL.Repositories;

namespace Typer.Tests.UnitTests.Domain
{
    [TestClass]
    public class UserRepositoryUnitTests
    {

        private EFUsersRepository repository;

        public UserRepositoryUnitTests()
        {
            repository = new EFUsersRepository();
        }

    }
}
