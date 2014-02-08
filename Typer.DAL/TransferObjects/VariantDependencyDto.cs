namespace Typer.DAL.TransferObjects
{
    public class VariantDependencyDto
    {
        public int Id { get; set; }
        public int MainSetId { get; set; }
        public int DependantSetId { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
    }
}
