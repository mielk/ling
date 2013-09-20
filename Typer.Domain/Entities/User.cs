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

        private static IUsersRepository usersRepository;

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



        public bool IsAuthorized()
        {
            string u = UserName;
            string p = Password;
            User x = usersRepository.getUser(2);
            return false;
        }


    }
}