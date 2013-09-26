using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ninject;
using Typer.Domain.Abstract;
using Typer.Domain.Concrete;

namespace Typer.Domain.Repositories
{
    public class UsersRepositoryFactory
    {

        public static readonly UsersRepositoryFactory instance = new UsersRepositoryFactory();

        [Inject]
        public IUsersRepository Repository { get; private set; }

    }
}