using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Typer.DAL.Repositories;

namespace Typer.Web.Controllers
{
    public class EditController : Controller
    {

        private IQuestionsRepository repository;

        public EditController(IQuestionsRepository repository)
        {
            this.repository = repository;
        }


        [AllowAnonymous]
        public ActionResult Index()
        {
            return View(repository.getQuestions());
        }

    }
}