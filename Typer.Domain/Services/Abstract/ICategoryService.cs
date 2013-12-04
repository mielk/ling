using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Entities;


namespace Typer.Domain.Services
{
    public interface ICategoryService
    {
        IEnumerable<Category> getCategories();
        Category getCategory(int id);
        bool activate(int id);
        bool deactivate(int id);
        bool updateName(Category category, string name);
        bool updateName(int id, string name);
        bool updateParent(Category category, int parentId);
        bool updateParent(int id, int parentId);
        Category getRoot();
    }
}
