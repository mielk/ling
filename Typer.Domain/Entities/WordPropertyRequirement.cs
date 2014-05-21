namespace Typer.Domain.Entities
{
    public class WordPropertyRequirement
    {
        public int Id { get; set; }
        public int LanguageId { get; set; }
        public int WordtypeId { get; set; }
        public int PropertyId { get; set; }
    }
}
