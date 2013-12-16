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
            if (_instance == null)
            {
                _instance = new CategoryServicesFactory();
            }

            return _instance;

        }


        public ICategoryService getService()
        {
            return service;
        }


    }
}
