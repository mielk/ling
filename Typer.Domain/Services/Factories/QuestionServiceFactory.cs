// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public class QuestionServicesFactory
    {

        private static QuestionServicesFactory _instance;

        private readonly IQuestionService service;



        private QuestionServicesFactory()
        {
            service = new QuestionService(null);
        }


        public static QuestionServicesFactory Instance()
        {
            return _instance ?? (_instance = new QuestionServicesFactory());
        }


        public IQuestionService GetService()
        {
            return service;
        }


    }
}