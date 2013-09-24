using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Abstract;

namespace Typer.Domain.Entities
{
    public class UsersRepositoryFactory
    {

        private static UsersRepositoryFactory instance;
        public IUsersRepository Repository { get; private set; }

        private UsersRepositoryFactory(IUsersRepository repository)
        {
            Repository = repository;
        }


        public static UsersRepositoryFactory getInstance()
        {
            if (instance == null)
            {
                instance = new UsersRepositoryFactory(getRepositoryInstance());
            }

            return instance;

        }


        private static IUsersRepository getRepositoryInstance(){
            IUsersRepository repository = null;
            return repository;
        }


    }
}
