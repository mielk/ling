namespace Typer.DAL.TransferObjects
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int? ParentId { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
    }
}
