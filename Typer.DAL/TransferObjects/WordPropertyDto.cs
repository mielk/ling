using System.ComponentModel.DataAnnotations;

namespace Typer.DAL.TransferObjects
{

    public class WordPropertyDto
    {
        [Key]
        public int Id { get; set; }
        public int WordId { get; set; }
        public int PropertyId { get; set; }
        public int ValueId { get; set; }
    }

}