namespace Typer.Domain.Entities
{
    public class VariantSetPropertyValue
    {
        public int Id { get; set; }
        public int VariantSetId { get; set; }
        public int PropertyId { get; set; }
        public int Value { get; set; }
    }
}