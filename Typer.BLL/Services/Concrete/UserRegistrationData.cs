using System;
using System.ComponentModel.DataAnnotations;

namespace Typer.BLL.Services
{
    public class UserRegistrationData
    {

        [Required]
        [Display(Name = "User name", Prompt = "Enter user name")]
        public string UserName { get; set; }


        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        public string ConfirmPassword { get; set; }



        //[Required]
        [Display(Name = "First name")]
        public string FirstName { get; set; }

        //[Required]
        [Display(Name = "Last name")]
        public string LastName { get; set; }

        //[Required]
        [Display(Name = "E-mail")]
        public string Email { get; set; }

        //[Required]
        [Display(Name = "Country")]
        public int CountryId { get; set; }

        //[Required]
        //[Display(Name = "Date of birth")]
        public DateTime DateOfBirth { get; set; }

    }
}
