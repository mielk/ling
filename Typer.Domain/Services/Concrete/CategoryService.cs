using System.Collections.Generic;
using System.Linq;
using Typer.DAL.Infrastructure;
using Typer.DAL.Repositories;
using Typer.DAL.TransferObjects;
using Typer.Domain.Entities;


// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public class CategoryService : ICategoryService
    {
        private const int RootID = 1;
        private static List<Category> _categories;
        private static readonly Dictionary<int, Category> CategoriesMap = new Dictionary<int,Category>();
        private static Category Root { get; set; }
        private static ICategoryRepository _repository;

        public CategoryService(ICategoryRepository repository)
        {
            _repository = _repository == null ? RepositoryFactory.GetCategoryRepository() : repository;
        }

        public IEnumerable<Category> GetCategories()
        {

            if (_categories == null)
                LoadCategories();

            return _categories;

        }

        public IEnumerable<Category> GetCategories(IEnumerable<int> ids)
        {
            if (_categories == null) LoadCategories();
            return _categories == null ? new List<Category>() : _categories.Where(c => ids.Contains(c.Id));
        }

        private static void LoadCategories()
        {

            var dataObjects = _repository.GetCategories();
            _categories = new List<Category>();

            foreach (var category in dataObjects.Select(CategoryFromDto))
            {
                _categories.Add(category);
                CategoriesMap.Add(category.Id, category);
            }

            //Create tree structure.
            if (!CategoriesMap.ContainsKey(RootID)) return;
            Category root;
            if (!CategoriesMap.TryGetValue(RootID, out root)) return;
            Root = root;

            foreach (var category in _categories.Where(category => category.ParentId > 0))
            {
                Category parent;
                if (!CategoriesMap.TryGetValue(category.ParentId, out parent)) continue;
                category.SetParent(parent);
                parent.AddChild(category);
            }
        }

        public Category GetCategory(int id)
        {

            if (_categories == null)
                LoadCategories();

            Category category;
            return CategoriesMap.TryGetValue(id, out category) ? category : null;

        }

        public bool Activate(int id)
        {
            return _repository.Activate(id);
        }

        public bool Deactivate(int id)
        {
            var category = GetCategory(id);
            if (category == null) return false;

            var parent = GetCategory(category.ParentId);
            if (parent != null)
            {
                parent.RemoveChild(category);
            }

            return _repository.Deactivate(id);
        }
        public bool UpdateName(Category category, string name)
        {
            return UpdateName(category.Id, name);
        }
        public bool UpdateName(int id, string name)
        {
            var category = GetCategory(id);
            if (category != null)
            {
                category.Name = name;
            }
            return _repository.UpdateName(id, name);
        }
        public bool UpdateParent(Category category, int parentId)
        {
            return UpdateParent(category.Id, parentId);
        }
        public bool UpdateParent(int id, int parentId)
        {
            var category = GetCategory(id);
            if (category != null)
            {
                category.ParentId = parentId;
            }
            return _repository.UpdateParent(id, parentId);
        }
        public int AddCategory(string name, int parentId, int userId)
        {

            var dto = new CategoryDto
            {
                Name = name,
                ParentId = parentId,
                IsActive = true
            };

            var id = _repository.AddCategory(dto);
            var category = new Category(id, name, parentId);
            var parent = GetCategory(parentId);
            if (parent != null)
            {
                parent.AddChild(category);
            }

            return id;

        }
        public Category GetRoot()
        {

            if (_categories == null)
                LoadCategories();

            return Root;

        }



        private static Category CategoryFromDto(CategoryDto dto)
        {
            return new Category(dto.Id, dto.Name, dto.ParentId){ IsActive = dto.IsActive };
        }


    }




}
