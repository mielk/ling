using System.Web.Mvc;
using Typer.Domain.Services;
using Typer.Web.Models;

namespace Typer.Web.Controllers
{
    public class TestController : Controller
    {

        private readonly IQuestionService questionService;
        private readonly ILanguageService languageService;

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
            var parent = languageService.GetLanguage(1);
            var learn = languageService.GetLanguage(2);
            var viewModel = new TestQuestionViewModel { Question = question, ParentLanguage = parent, LearnLanguage = learn };



            return View(viewModel);

        }

    }
}
