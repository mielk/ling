using System.Web.Mvc;
using Typer.Domain.Services;
using Typer.Web.Models;

namespace Typer.Web.Controllers
{
    public class TestController : Controller
    {

        private readonly IQuestionService _questionService;
        private readonly ILanguageService _languageService;

        public TestController(IQuestionService questionService, ILanguageService languageService)
        {
            _questionService = questionService;
            _languageService = languageService;
        }


        [AllowAnonymous]
        public ActionResult Index2()
        {
            return View();
        }

        [AllowAnonymous]
        public ActionResult Index()
        {
            var question = _questionService.GetQuestion(1);
            var parent = _languageService.GetLanguage(1);
            var learn = _languageService.GetLanguage(2);
            var viewModel = new TestQuestionViewModel { Question = question, ParentLanguage = parent, LearnLanguage = learn };



            return View(viewModel);

        }

    }
}
