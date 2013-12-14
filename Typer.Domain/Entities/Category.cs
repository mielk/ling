using System.Collections.Generic;

namespace Typer.Domain.Entities
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ParentId { get; set; }
        public IEnumerable<Category> Children { get; set; }
        public bool IsActive { get; set; }

        public Category(int id, string name, int? parentId)
        {
            Id = id;
            Name = name;
            ParentId = (parentId == null ? 0 : (int) parentId);
            Children = new List<Category>();
        }

        public void AddChild(Category child)
        {
            ((List<Category>)Children).Add(child);
        }

        public void RemoveChild(Category child)
        {
            ((List<Category>)Children).Remove(child);
        }

    }
}