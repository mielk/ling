using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Typer.Domain.Services;

namespace Typer.Domain.Entities
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int ParentId { get; set; }
        public IEnumerable<Category> Children { get; set; }
        public bool IsActive { get; set; }
        private Category parent;

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

        public void SetParent(Category parentalCategory)
        {
            parent = parentalCategory;
        }

        public string FullPath()
        {
            if (parent == null) return string.Empty;
            var parentPath = parent.FullPath();
            return parentPath + (parentPath.Length > 0 ? " > " : string.Empty) + Name;
        }

        public static IEnumerable<Category> GetCollection(JToken token)
        {
            var service = CategoryServicesFactory.Instance().GetService();

            return token.Children().
                Select(item => (int) item.SelectToken("Id")).
                Select(service.GetCategory).
                Where(category => category != null).
                ToList();

        }

    }
}