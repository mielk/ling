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
    public class QuestionsController : Controller
    {

        private ILanguageService languageService = LanguageServicesFactory.Instance().getService();
        private readonly IQuestionService service;
        public int PageSize = 10;
        private RedirectResult navigationPoint
        {
            get { return Session["EditControllerNavigationPoint"] as RedirectResult; }
            set { Session["EditControllerNavigationPoint"] = value; }
        }



        public QuestionsController(IQuestionService service)
        {
            this.service = service;
        }


        private void setNavigationPoint()
        {
            navigationPoint = Request.UrlReferrer == null ? null : Redirect(Request.UrlReferrer.ToString());
        }




        [AllowAnonymous]
        public ViewResult List(int page = 1)
        {
            QuestionsListViewModel model = new QuestionsListViewModel {
                Questions = service.getQuestions().
                OrderBy(q => q.Id).
                Skip((page - 1) * PageSize).
                Take(PageSize),
                PagingInfo = new PagingInfo {
                    CurrentPage = page,
                    ItemsPerPage = PageSize,
                    TotalItems = service.getQuestions().Count()
                }
            };
            return View(model);

        }



        [AllowAnonymous]
        public ActionResult UpdateWeight(int id, int weight)
        {
            service.changeWeight(id, weight);
            return Redirect(Request.UrlReferrer.ToString());
        }




        [AllowAnonymous]
        public ActionResult Deactivate(int id)
        {
            service.deactivate(id);
            return Redirect(Request.UrlReferrer.ToString());
        }


        [AllowAnonymous]
        public ActionResult Activate(int id)
        {
            service.activate(id);
            return Redirect(Request.UrlReferrer.ToString());
        }


        #region Helpers
        //Close current subpage and navigate to start page.
        private ActionResult NavigateToHomePage()
        {

            RedirectResult url = navigationPoint;

            if (url != null)
            {
                return url;
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }

        }



        [HttpPost]
        [AllowAnonymous]
        public ActionResult CheckName(int id, string name)
        {
            bool isExisting = service.nameExists(id, name);
            return Json(new { IsExisting = isExisting }, JsonRequestBehavior.AllowGet);
        }

        #endregion




        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetQuestion(int id)
        {
            User user = (User) HttpContext.Session[Typer.Domain.Entities.User.SESSION_KEY];
            Question question = service.getQuestion(id);
            QuestionViewModel questionViewModel = new QuestionViewModel(question, 1);//user.UserID);
            return Json(questionViewModel, JsonRequestBehavior.AllowGet);

        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetLanguages()
        {
            User user = (User) HttpContext.Session[Typer.Domain.Entities.User.SESSION_KEY];
            IEnumerable<Language> languages = languageService.getUserLanguages(1);//user.UserID);
            return Json(languages, JsonRequestBehavior.AllowGet);

        }
        

    }
}