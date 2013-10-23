using System.ComponentModel.DataAnnotations;

namespace Typer.DAL.TransferObjects
{
    public class LanguageDto
    {
        [Key()]
        public int Id { get; set; }
        public string Name { get; set; }
    }

}