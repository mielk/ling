using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Abstract;

namespace Typer.Domain.Entities
{
    public class User
    {

        #region UsersRepository
        private static IUsersRepository usersRepository;

        public static void injectUsersRepository(IUsersRepository repository)
        {
            usersRepository = repository;
        }

        public static IUsersRepository getUsersRepository()
        {
            return usersRepository;
        }
        #endregion UsersRepositoryInstance




        #region InstanceProperties

        public int UserID { get; set; }

        [Required]
        [Display(Name = "User name", Prompt = "Enter user name")]
        public string UserName { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        #endregion InstanceProperties





        public bool IsAuthenticated()
        {

            if (usersRepository == null) throw new NullReferenceException("No repository has been injected.");


            string u = UserName;
            string p = Password;

            if (u == null || u == string.Empty) return false;
            if (p == null || p == string.Empty) return false;

            User x = usersRepository.getUser(2);
            return false;

        }

        //private bool isEmptyString(string username


    }
}