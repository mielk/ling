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
        public int? ParentId { get; set; }
        public Category Parent { get; set; }
        public IEnumerable<Category> children { get; set; }
        public bool IsActive { get; set; }


        public Category()
        {
            children = new List<Category>();
        }

        public void addChild(Category child)
        {
            ((List<Category>)children).Add(child);
        }

    }
}