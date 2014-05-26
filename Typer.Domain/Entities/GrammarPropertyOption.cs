namespace Typer.Domain.Entities
{
    public class GrammarPropertyOption
    {
        public int Id {get;set;}
        public int PropertyId {get;set;}
        public string Name {get;set;}
        public int Value {get;set;}
        public bool Default {get;set;}
    }
}
