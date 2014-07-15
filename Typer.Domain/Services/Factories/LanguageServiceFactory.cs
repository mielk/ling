// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public class LanguageServicesFactory
    {

        private static LanguageServicesFactory _instance;

        private readonly ILanguageService service;



        private LanguageServicesFactory()
        {
            service = new LanguageService(null);
        }


        public static LanguageServicesFactory Instance()
        {
            return _instance ?? (_instance = new LanguageServicesFactory());
        }


        public ILanguageService GetService()
        {
            return service;
        }


    }
}