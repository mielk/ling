using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Repositories
{
    public class EFCategoriesRepository : ICategoryRepository
    {

        private static readonly EFDbContext context = EFDbContext.getInstance();



        public IEnumerable<CategoryDto> getCategories()
        {
            return context.Categories;
        }

        public CategoryDto getCategory(int id)
        {
            return context.Categories.SingleOrDefault(q => q.Id == id);
        }




        public bool addCategory(CategoryDto category)
        {
            try
            {
                context.Categories.Add(category);
                context.SaveChanges();
                return true;
            }
            catch (Exception exception)
            {
                return false;
            }
        }




        #region Update methods.

        public bool updateName(int id, string name)
        {
            CategoryDto category = getCategory(id);
            if (category != null)
            {
                try
                {
                    category.Name = name;
                    context.SaveChanges();
                    return true;
                }
                catch (Exception exception)
                {
                    return false;
                }
            }

            return false;
        }

        public bool updateParent(int id, int parentId)
        {
            CategoryDto category = getCategory(id);
            if (category != null)
            {
                try
                {
                    category.ParentId = parentId;
                    context.SaveChanges();
                    return true;
                }
                catch (Exception exception)
                {
                    return false;
                }
            }

            return false;

        }

        public bool updateProperties(int id, string name, int parentId)
        {
            CategoryDto category = getCategory(id);
            if (category != null)
            {
                try
                {
                    category.Name = name;
                    category.ParentId = parentId;
                    context.SaveChanges();
                    return true;
                }
                catch (Exception exception)
                {
                    return false;
                }
            }

            return false;
        }
        
        #endregion










        public bool activate(int id)
        {
            CategoryDto category = getCategory(id);
            if (category != null)
            {
                if (category.IsActive)
                    return true;

                try
                {
                    category.IsActive = true;
                    context.SaveChanges();
                    return true;
                }
                catch (Exception exception)
                {
                    return false;
                }

            }

            return false;

        }

        public bool deactivate(int id)
        {
            CategoryDto category = getCategory(id);
            if (category != null)
            {

                if (!category.IsActive)
                    return false;

                try
                {
                    category.IsActive = false;
                    context.SaveChanges();
                    return true;
                }
                catch (Exception exception)
                {
                    return false;
                }

            }

            return false;

        }


    }
}