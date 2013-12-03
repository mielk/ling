using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Infrastructure;
using Typer.DAL.Repositories;
using Typer.DAL.TransferObjects;
using Typer.Domain.Entities;


namespace Typer.Domain.Services
{
    public class CategoryService : ICategoryService
    {
        private static readonly int ROOT_ID = 1;
        private static List<Category> categories;
        private static Dictionary<int, Category> categoriesMap = new Dictionary<int,Category>();
        private static Category root { get; set; }
        private static ICategoryRepository repository;

        public CategoryService(ICategoryRepository _repository)
        {

            if (repository == null)
            {
                repository = RepositoryFactory.getCategoryRepository();
            }
            else
            {
                repository = _repository;
            }
        }

        public IEnumerable<Category> getCategories()
        {

            if (categories == null)
                loadCategories();

            return categories;

        }

        private static void loadCategories()
        {

            IEnumerable<CategoryDto> dataObjects = repository.getCategories();
            categories = new List<Category>();

            foreach (CategoryDto dto in dataObjects)
            {
                Category category = categoryFromDto(dto);
                categories.Add(category);
                categoriesMap.Add(category.Id, category);
            }

            //Create tree structure.
            if (categoriesMap.ContainsKey(ROOT_ID))
            {

                Category _root;
                if (categoriesMap.TryGetValue(ROOT_ID, out _root)){
                    root = _root;

                    foreach (Category category in categories)
                    {
                        if (category.ParentId > 0)
                        {
                            Category parent;
                            if (categoriesMap.TryGetValue(category.ParentId, out parent))
                            {
                                category.setParent(parent);
                                parent.addChild(category);
                            }
                        }
                    }

                }

            }

        }

        public Category getCategory(int id)
        {

            if (categories == null)
                loadCategories();

            Category category;
            if (categoriesMap.TryGetValue(id, out category))
            {
                return category;
            }
            else
            {
                return null;
            }

        }

        public bool activate(int id)
        {
            return repository.activate(id);
        }

        public bool deactivate(int id)
        {
            return repository.deactivate(id);
        }
        public bool updateName(Category category, string name)
        {
            return repository.updateName(category.Id, name);
        }
        public bool updateParent(Category category, int parentId)
        {
            return repository.updateParent(category.Id, parentId);
        }
        public Category getRoot()
        {

            if (categories == null)
                loadCategories();

            return root;

        }



        private static Category categoryFromDto(CategoryDto dto)
        {
            return new Category(dto.Id, dto.Name, dto.ParentId){ IsActive = dto.IsActive };
        }

        private static CategoryDto categoryToDto(Category category)
        {
            return new CategoryDto()
            {
                Id = category.Id,
                IsActive = category.IsActive,
                Name = category.Name,
                ParentId = category.ParentId
            };
        }


    }




}
