namespace Typer.Domain.Entities
{
    public class WordtypePropertyValue
    {
        public int Id { get; set; }
        public int WordId { get; set; }
        public int PropertyId { get; set; }
        public int Value { get; set; }
    }
}