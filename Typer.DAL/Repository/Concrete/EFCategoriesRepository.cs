using System;
using System.Collections.Generic;
using System.Linq;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;

// ReSharper disable once CheckNamespace
namespace Typer.DAL.Repositories
{
    public class EfCategoriesRepository : ICategoryRepository
    {

        private static readonly EFDbContext Context = EFDbContext.GetInstance();



        public IEnumerable<CategoryDto> GetCategories()
        {
            return Context.Categories.Where(q => q.IsActive);
        }

        public CategoryDto GetCategory(int id)
        {
            return Context.Categories.SingleOrDefault(q => q.Id == id);
        }




        public int AddCategory(CategoryDto category)
        {
            try
            {
                Context.Categories.Add(category);
                Context.SaveChanges();
                return category.Id;
            }
            catch (Exception)
            {
                return -1;
            }
        }




        #region Update methods.

        public bool UpdateName(int id, string name)
        {
            var category = GetCategory(id);
            if (category == null) return false;
            try
            {
                category.Name = name;
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool UpdateParent(int id, int parentId)
        {
            var category = GetCategory(id);
            if (category == null) return false;
            try
            {
                category.ParentId = parentId;
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool UpdateProperties(int id, string name, int parentId)
        {
            var category = GetCategory(id);
            if (category == null) return false;
            try
            {
                category.Name = name;
                category.ParentId = parentId;
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
        
        #endregion










        public bool Activate(int id)
        {
            var category = GetCategory(id);
            if (category == null) return false;
            if (category.IsActive)
                return true;

            try
            {
                category.IsActive = true;
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool Deactivate(int id)
        {
            var category = GetCategory(id);
            if (category == null) return false;
            if (!category.IsActive)
                return false;

            try
            {
                category.IsActive = false;
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }


    }
}