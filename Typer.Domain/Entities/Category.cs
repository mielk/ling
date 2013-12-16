using System.Collections.Generic;
using System.ComponentModel;

namespace Typer.Domain.Entities
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ParentId { get; set; }
        public IEnumerable<Category> Children { get; set; }
        public bool IsActive { get; set; }
        private Category _parent;

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

        public void SetParent(Category parent)
        {
            _parent = parent;
        }

        public string FullPath()
        {
            if (_parent == null) return string.Empty;
            var parentPath = _parent.FullPath();
            return parentPath + (parentPath.Length > 0 ? " > " : string.Empty) + Name;
        }

    }
}