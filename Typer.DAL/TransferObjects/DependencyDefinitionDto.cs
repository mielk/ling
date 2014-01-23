namespace Typer.DAL.TransferObjects
{
    public class DependencyDefinitionDto
    {
        public int Id { get; set; }
        public int LanguageId { get; set; }
        public int MasterWordtypeId { get; set; }
        public int SlaveWordtypeId { get; set; }
    }
}
