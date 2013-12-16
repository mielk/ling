using System.Web.Mvc;
using Typer.Domain.Services;
using Typer.Web.Models;

namespace Typer.Web.Controllers
{
    public class TestController : Controller
    {

        private IQuestionService questionService;
        private ILanguageService languageService;

        public TestController(IQuestionService questionService, ILanguageService languageService)
        {
            this.questionService = questionService;
            this.languageService = languageService;
        }


        [AllowAnonymous]
        public ActionResult Index2()
        {
            return View();
        }

        [AllowAnonymous]
        public ActionResult Index()
        {
            var question = questionService.GetQuestion(1);
            var parent = languageService.getLanguage(1);
            var learn = languageService.getLanguage(2);
            var viewModel = new TestQuestionViewModel { Question = question, ParentLanguage = parent, LearnLanguage = learn };



            return View(viewModel);

        }

    }
}
