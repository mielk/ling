using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Typer.Domain.Helpers;

namespace Typer.Domain.Entities
{
    public class UserRegistrationData
    {

        public static readonly int UserNameMinimumLength = 5;
        public static readonly int UserNameMaximumLength = 20;
        public static readonly int PasswordMinimumLength = 6;


        [Required]
        [Display(Name = "User name", Prompt = "Enter user name")]
        public string UserName { get; set; }


        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        //[Required]
        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        public string ConfirmPassword { get; set; }



        //[Required]
        [Display(Name = "First name")]
        public string FirstName { get; set; }

        //[Required]
        [Display(Name = "Last name")]
        public string LastName { get; set; }

        [Required]
        [Display(Name = "E-mail")]
        public string Email { get; set; }

        //[Required]
        [Display(Name = "Country")]
        public int CountryId { get; set; }

        //[Required]
        //[Display(Name = "Date of birth")]
        public DateTime DateOfBirth { get; set; }



        public bool isValid()
        {
            if (!isUserNameValid())
                return false;

            if (!isPasswordValid())
                return false;

            if (!arePasswordsMatching())
                return false;

            if (!isMailValid())
                return false;

            return true;

        }


        private bool isUserNameValid()
        {
            if (UserName == null || UserName.Length < UserNameMinimumLength || UserName.Length > UserNameMaximumLength)
                return false;

            return true;

        }

        private bool isPasswordValid()
        {

            string regex = @"^.*(?=.*\d)(?=.*[a-zA-Z]).*$";

            if (Password == null || Password.Length < PasswordMinimumLength)
                return false;

            return Regex.IsMatch(Password, regex);

        }

        private bool arePasswordsMatching()
        {

            if (ConfirmPassword == null || ConfirmPassword == string.Empty)
                return false;

            return (ConfirmPassword == Password);

        }

        private bool isMailValid()
        {
            return Email.isLegalMail();
        }


    }
}
