namespace Typer.Domain.Entities
{
    public class WordtypeProperty
    {
        public int Id { get; set; }
        public int LanguageId { get; set; }
        public int WordtypeId { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Details { get; set; }
    }
}
