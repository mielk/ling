using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Typer.Domain.Services;
using Typer.DAL.Repositories;
using Typer.Domain.Entities;
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
            Question question = questionService.getQuestion(1);
            Language parent = languageService.getLanguage(1);
            Language learn = languageService.getLanguage(2);
            TestQuestionViewModel viewModel = new TestQuestionViewModel() { Question = question, ParentLanguage = parent, LearnLanguage = learn };



            return View(viewModel);

        }

    }
}
