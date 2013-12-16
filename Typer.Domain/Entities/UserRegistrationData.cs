using System;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Typer.Common.Helpers;
using Typer.Domain.Services;

namespace Typer.Domain.Entities
{
    public class UserRegistrationData
    {

        private readonly IUserService service;

        public static readonly int UserNameMinimumLength = 5;
        public static readonly int UserNameMaximumLength = 20;
        public static readonly int PasswordMinimumLength = 6;


        public UserRegistrationData()
        {
            service = UserServicesFactory.Instance().getUserService();
        }

        public UserRegistrationData(IUserService service)
        {
            this.service = service;
        }


        
        #region Properties.

        [Required]
        [Display(Name = "User name", Prompt = "Enter user name")]
        private string username { get; set; }
        public string Username
        {
            get
            {
                return username == null ? null : username.ToLower();
            }
            set
            {
                username = (value == null ? null : value.ToLower());
            }
        }


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

        #endregion Properties.
        


        
        #region Validation.


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
            if (Username == null || Username.Length < UserNameMinimumLength || Username.Length > UserNameMaximumLength)
                return false;

            if (!isUserNameUnique())
                return false;

            return true;

        }

        private bool isUserNameUnique()
        {
            return !service.userExists(Username);
        }

        private bool isPasswordValid()
        {

            var regex = @"^.*(?=.*\d)(?=.*[a-zA-Z]).*$";

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
            if (!Email.isLegalMail())
                return false;

            if (service.mailExists(Email))
                return false;

            return true;

        }


        #endregion Validation.
        



        public User toUser()
        {
            var user = new User { 
                Username = Username, 
                Password = SHA1.Encode(Password),
                Email = Email,
                FirstName = null,
                LastName = null,
                CountryId = null,
                DateOfBirth = null,
                RegistrationDate = DateTime.Now,
                IsActive = true
            };

            return user;

        }



    }
}
