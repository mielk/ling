using System;
using System.ComponentModel.DataAnnotations;

namespace Typer.Domain.Entities
{
    public class User
    {

        public const string SessionKey = "User";

        public static int CurrentUserId = 1;

        #region Instance properties.
        //
        
        public int UserID { get; set; }

        //[Required]
        //[Display(Name = "User name", Prompt = "Enter user name")]
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

        //[Required]
        //[Display(Name = "First name")]
        public string FirstName { get; set; }

        //[Required]
        //[Display(Name = "Last name")]
        public string LastName { get; set; }

        //[Required]
        //[DataType(DataType.Password)]
        //[Display(Name = "Password")]
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

        //public string ConfirmationCode { get; set; }
        //public DateTime? ConfirmationDate { get; set; }

        public bool IsActive { get; set; }

        public bool MailVerified { get; set; }

        public string VerificationCode { get; set; }

        public DateTime? VerificationDate { get; set; }

        //
        #endregion Instance properties.


        //public void generateVerificationData()
        //{
        //    MailVerified = false;
        //    VerificationCode = Guid.NewGuid().ToString().Replace("-", "");
        //    VerificationDate = null;
        //}


    }
}