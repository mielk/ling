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
            if (_instance == null)
            {
                _instance = new QuestionServicesFactory();
            }

            return _instance;

        }


        public IQuestionService getService()
        {
            return service;
        }


    }
}