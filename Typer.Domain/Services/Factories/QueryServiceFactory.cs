// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public class QuestionServicesFactory
    {

        private static QuestionServicesFactory _instance;

        private readonly IQueryService _service;



        private QuestionServicesFactory()
        {
            _service = new QueryService(null);
        }


        public static QuestionServicesFactory Instance()
        {
            return _instance ?? (_instance = new QuestionServicesFactory());
        }


        public IQueryService GetService()
        {
            return _service;
        }


    }
}