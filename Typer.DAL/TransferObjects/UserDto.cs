using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.DAL.TransferObjects
{
    public class UserDto
    {

        public int UserID { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public int? CountryId { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public bool IsActive { get; set; }
        public bool MailVerified { get; set; }
        public string VerificationCode { get; set; }
        public DateTime? VerificationDate { get; set; }

        public UserDto()
        {
        }

    }
}
