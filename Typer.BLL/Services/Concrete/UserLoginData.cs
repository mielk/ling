using System.ComponentModel.DataAnnotations;

namespace Typer.BLL.Services
{
    public class UserLoginData
    {

        [Required]
        [Display(Name = "User name", Prompt = "Enter user name")]
        public string Username { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

    }
}
