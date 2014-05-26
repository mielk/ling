using System.ComponentModel.DataAnnotations;

namespace Typer.Domain.Entities
{
    public class UserLoginData
    {

        [Required]
        [Display(Name = "User name", Prompt = "Enter user name")]
        private string _username;
        public string Username
        {
            get
            {
                return _username == null ? null : _username.ToLower();
            }
            set
            {
                _username = (value == null ? null : value.ToLower());
            }
        }


        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

    }
}
