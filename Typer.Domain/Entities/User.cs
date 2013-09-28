using System;
using System.ComponentModel.DataAnnotations;

namespace Typer.Domain.Entities
{
    public class User
    {

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
        public bool IsActive { get; set; }

        //
        #endregion Instance properties.

    }
}