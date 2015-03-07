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

        //[AllowAnonymous]
        //public ActionResult Index()
        //{
        //    var question = questionService.GetQuestion(1);
        //    var parent = languageService.GetLanguage(1);
        //    var learn = languageService.GetLanguage(2);
        //    var viewModel = new TestQuestionViewModel { Question = question, ParentLanguage = parent, LearnLanguage = learn };



        //    return View(viewModel);

        //}

        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetQueries(int userId, int baseLanguage, int learnedLanguage)
        {
            var queries = questionService.GetQueries(userId, baseLanguage, learnedLanguage);
            return Json(new { queries = queries }, JsonRequestBehavior.AllowGet);

        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult SaveAnswer(int questionId, int userId, int baseLanguage, int learnedLanguage, int counter, int correct, string last50, int toDo)
        {
            var result = questionService.SaveAnswer(questionId, userId, baseLanguage, learnedLanguage, counter, correct, last50, toDo);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

    }
}
