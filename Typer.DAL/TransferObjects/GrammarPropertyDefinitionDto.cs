namespace Typer.DAL.TransferObjects
{
    public class GrammarPropertyDefinitionDto
    {
        public int Id { get; set; }
        public int LanguageId { get; set; }
        public string Name { get; set; }
        public int Type { get; set; }
        public bool Default { get; set; }
    }
}