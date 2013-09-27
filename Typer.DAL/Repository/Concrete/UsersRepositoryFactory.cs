using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Ninject;

namespace Typer.DAL.Repositories
{
    public class UsersRepositoryFactory
    {

        public static readonly UsersRepositoryFactory instance = new UsersRepositoryFactory();

        [Inject]
        public IUsersRepository Repository { get; private set; }

    }
}