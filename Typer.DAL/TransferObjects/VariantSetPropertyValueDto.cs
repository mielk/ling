namespace Typer.DAL.TransferObjects
{
    public class VariantSetPropertyValueDto
    {
        public int Id { get; set; }
        public int VariantSetId { get; set; }
        public int PropertyId { get; set; }
        public int Value { get; set; }
    }
}