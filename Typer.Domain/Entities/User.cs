using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Abstract;
using Typer.Domain.Helpers;
using Typer.Domain.Services;
using Ninject;

namespace Typer.Domain.Entities
{
    public class User
    {

        #region Static properties.
        //

        [Inject]
        private static IUserServices userServices;

        //
        #endregion Static properties.


        #region Instance properties.
        //
        
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

        //
        #endregion Instance properties.


        #region Authentication.
        //


        public bool IsAuthenticated()
        {
            return userServices.IsAuthenticated(UserName, SHA1.Encode(Password));
        }


        //
        #endregion Authentication.



    }
}