// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public class GrammarServicesFactory
    {

        private static GrammarServicesFactory _instance;

        private readonly IGrammarService _service;



        private GrammarServicesFactory()
        {
            _service = new GrammarService(null);
        }


        public static GrammarServicesFactory Instance()
        {
            return _instance ?? (_instance = new GrammarServicesFactory());
        }


        public IGrammarService GetService()
        {
            return _service;
        }


    }
}
