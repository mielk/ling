namespace Typer.DAL.TransferObjects
{
    public class GrammarFormDefinitonDto
    {
        public int Id { get; set; }
        public string Key { get; set; }
        public int LanguageId { get; set; }
        public int WordtypeId { get; set; }
        public string Name { get; set; }
        public string Group { get; set; }
        public bool IsHeader { get; set; }
        public string InactiveRules { get; set; }
        public int Index { get; set; }
    }
}