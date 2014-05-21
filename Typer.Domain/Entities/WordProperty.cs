namespace Typer.Domain.Entities
{
    public class WordProperty
    {
        public int Id { get; set; }
        public int WordId { get; set; }
        public int PropertyId { get; set; }
        public int ValueId { get; set; }
    }
}