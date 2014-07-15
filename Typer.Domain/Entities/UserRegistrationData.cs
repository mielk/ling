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
            service = UserServicesFactory.Instance().GetUserService();
        }

        public UserRegistrationData(IUserService service)
        {
            this.service = service;
        }


        
        #region Properties.

        [Required] [Display(Name = "User name", Prompt = "Enter user name")] 
        private string username;
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


        public bool IsValid()
        {
            if (!IsUserNameValid())
                return false;

            if (!IsPasswordValid())
                return false;

            if (!ArePasswordsMatching())
                return false;

            if (!IsMailValid())
                return false;

            return true;

        }


        private bool IsUserNameValid()
        {
            if (Username == null || Username.Length < UserNameMinimumLength || Username.Length > UserNameMaximumLength)
                return false;

            if (!IsUserNameUnique())
                return false;

            return true;

        }

        private bool IsUserNameUnique()
        {
            return !service.UserExists(Username);
        }

        private bool IsPasswordValid()
        {

            const string regex = @"^.*(?=.*\d)(?=.*[a-zA-Z]).*$";

            if (Password == null || Password.Length < PasswordMinimumLength)
                return false;

            return Regex.IsMatch(Password, regex);

        }

        private bool ArePasswordsMatching()
        {

            if (string.IsNullOrEmpty(ConfirmPassword))
                return false;

            return (ConfirmPassword == Password);

        }

        private bool IsMailValid()
        {
            if (!Email.IsLegalMail())
                return false;

            return !service.MailExists(Email);
        }


        #endregion Validation.
        



        public User ToUser()
        {
            var user = new User { 
                Username = Username, 
                Password = Sha1.Encode(Password),
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
