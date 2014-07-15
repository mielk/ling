// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public class WordServicesFactory
    {

        private static WordServicesFactory _instance;

        private readonly IWordService service;



        private WordServicesFactory()
        {
            service = new WordService(null);
        }


        public static WordServicesFactory Instance()
        {
            return _instance ?? (_instance = new WordServicesFactory());
        }


        public IWordService GetService()
        {
            return service;
        }


    }
}