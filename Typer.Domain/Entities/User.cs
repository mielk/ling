using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Abstract;
using Typer.Domain.Helpers;
using Typer.Domain.Repositories;

namespace Typer.Domain.Entities
{
    public class User
    {

        //Static properties.
        private static IUsersRepository usersRepository;

        //Instance properties.
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

        public int CountryId { get; set; }
        public DateTime DateOfBirth { get; set; }
        public DateTime RegistrationDate { get; set; }
        public string Email { get; set; }




        static User()
        {
            checkUsersRepository();
        }


        //User repository methods.
        #region User repository methods.
        public static void injectUsersRepository(IUsersRepository repository)
        {
            usersRepository = repository;
        }

        public static IUsersRepository getUsersRepository()
        {
            return usersRepository;
        }

        private static void checkUsersRepository()
        {
            if (usersRepository == null)
            {
                injectUsersRepository(UsersRepositoryFactory.instance.Repository);
            }
        }
        #endregion User repository methods.




        //Authentication.
        #region Authentication.
        public bool IsAuthenticated()
        {

            //Username and password cannot be null nor empty.
            if (UserName.isNullOrEmpty() || Password.isNullOrEmpty()) return false;
            return usersRepository.logUser(UserName, SHA1.Encode(Password));

        }
        #endregion Authentication.



    }
}