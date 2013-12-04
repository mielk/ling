using System.Collections.Generic;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Repositories
{
    public interface ICategoryRepository
    {
        IEnumerable<CategoryDto> getCategories();
        CategoryDto getCategory(int id);

        int addCategory(CategoryDto category);

        bool updateName(int id, string name);
        bool updateParent(int id, int parentId);
        bool updateProperties(int id, string name, int parentId);

        bool activate(int id);
        bool deactivate(int id);
        
    }
}