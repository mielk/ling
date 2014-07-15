// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public class CategoryServicesFactory
    {

        private static CategoryServicesFactory _instance;

        private readonly ICategoryService service;



        private CategoryServicesFactory()
        {
            service = new CategoryService(null);
        }


        public static CategoryServicesFactory Instance()
        {
            return _instance ?? (_instance = new CategoryServicesFactory());
        }


        public ICategoryService GetService()
        {
            return service;
        }


    }
}
