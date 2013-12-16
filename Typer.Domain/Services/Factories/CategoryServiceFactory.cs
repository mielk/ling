// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public class CategoryServicesFactory
    {

        private static CategoryServicesFactory _instance;

        private readonly ICategoryService _service;



        private CategoryServicesFactory()
        {
            _service = new CategoryService(null);
        }


        public static CategoryServicesFactory Instance()
        {
            return _instance ?? (_instance = new CategoryServicesFactory());
        }


        public ICategoryService GetService()
        {
            return _service;
        }


    }
}
