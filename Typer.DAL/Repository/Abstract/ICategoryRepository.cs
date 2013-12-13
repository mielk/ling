using System.Collections.Generic;
using Typer.DAL.TransferObjects;

// ReSharper disable once CheckNamespace
namespace Typer.DAL.Repositories
{
    public interface ICategoryRepository
    {
        IEnumerable<CategoryDto> GetCategories();
        CategoryDto GetCategory(int id);

        int AddCategory(CategoryDto category);

        bool UpdateName(int id, string name);
        bool UpdateParent(int id, int parentId);
        bool UpdateProperties(int id, string name, int parentId);

        bool Activate(int id);
        bool Deactivate(int id);
        
    }
}