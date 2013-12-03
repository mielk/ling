using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.Domain.Entities
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ParentId { get; set; }
        private Category parent;
        public IEnumerable<Category> children { get; set; }
        public bool IsActive { get; set; }


        public Category(int id, string name, int? parentId)
        {
            this.Id = id;
            this.Name = name;
            this.ParentId = (parentId == null ? 0 : (int) parentId);
            children = new List<Category>();
        }

        public void addChild(Category child)
        {
            ((List<Category>)children).Add(child);
        }

        public void setParent(Category _parent)
        {
            parent = _parent;
        }

    }
}