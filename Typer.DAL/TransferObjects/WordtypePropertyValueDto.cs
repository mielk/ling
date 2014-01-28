using System.ComponentModel.DataAnnotations;

namespace Typer.DAL.TransferObjects
{

    public class WordtypePropertyValueDto
    {
        [Key]
        public int Id { get; set; }
        public int WordId { get; set; }
        public int PropertyId { get; set; }
        public int Value { get; set; }
    }

}