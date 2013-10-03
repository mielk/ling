using System;
using System.ComponentModel.DataAnnotations;
using Typer.Domain.Helpers;

namespace Typer.Domain.Entities
{
    public class User
    {

        #region Instance properties.
        //
        
        public int UserID { get; set; }

        //[Required]
        //[Display(Name = "User name", Prompt = "Enter user name")]
        public string UserName { get; set; }

        //[Required]
        //[Display(Name = "First name")]
        public string FirstName { get; set; }

        //[Required]
        //[Display(Name = "Last name")]
        public string LastName { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        //[Required]
        [Display(Name = "E-mail")]
        public string Email { get; set; }        

        //[Required]
        [Display(Name = "Country")]
        public int? CountryId { get; set; }

        //[Required]
        //[Display(Name = "Date of birth")]
        public DateTime? DateOfBirth { get; set; }
        public DateTime? RegistrationDate { get; set; }

        public bool IsActive { get; set; }

        //
        #endregion Instance properties.


        public User(UserRegistrationData urd)
        {
            UserName = urd.UserName;
            FirstName = null;
            LastName = null;
            Password = SHA1.Encode(urd.Password);
            Email = urd.Email;
            CountryId = null;
            DateOfBirth = null;
            RegistrationDate = DateTime.Now;
        }


    }
}