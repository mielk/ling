using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Abstract;
using Typer.Domain.Concrete;

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
                instance = new UsersRepositoryFactory(getRepoInstance());
            }

            return instance;

        }


        private static IUsersRepository getRepoInstance()
        {
            return EFUsersRepository.getInstance();
        }




    }
}
