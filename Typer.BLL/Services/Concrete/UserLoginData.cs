using System.ComponentModel.DataAnnotations;

namespace Typer.BLL.Services
{
    public class UserLoginData
    {

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
                username = (value == null ? value : value.ToLower());
            }
        }


        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

    }
}
