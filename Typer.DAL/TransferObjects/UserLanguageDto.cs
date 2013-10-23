using System.ComponentModel.DataAnnotations;

namespace Typer.DAL.TransferObjects
{
    public class UserLanguageDto
    {
        [Key()]
        public int Id { get; set; }
        public int LanguageId { get; set; }
        public int UserId { get; set; }
    }
}
