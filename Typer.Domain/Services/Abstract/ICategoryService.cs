using System.Collections.Generic;
using Typer.Domain.Entities;


// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public interface ICategoryService
    {
        IEnumerable<Category> GetCategories();
        IEnumerable<Category> GetCategories(IEnumerable<int> ids);
        Category GetCategory(int id);
        bool Activate(int id);
        bool Deactivate(int id);
        bool UpdateName(Category category, string name);
        bool UpdateName(int id, string name);
        bool UpdateParent(Category category, int parentId);
        bool UpdateParent(int id, int parentId);
        int AddCategory(string name, int parentId, int userId);
        Category GetRoot();
    }
}
