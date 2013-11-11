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



        [HttpGet]
        [AllowAnonymous]
        public ActionResult Edit(int id)
        {

            setNavigationPoint();

            Question question = service.getQuestion(id);
            IEnumerable<QuestionOption> options = question.Options;
            User user = (User)HttpContext.Session[Typer.Domain.Entities.User.SESSION_KEY];

            if (user == null || user.UserID == 0)
                user = new User(){ Username = "test", UserID = 1 };

            QuestionEditViewModel questionViewModel = new QuestionEditViewModel(question, user);


            if (questionViewModel != null && questionViewModel.isValid())
            {
                return View(questionViewModel);
            } else {
                return Redirect(Request.Url.ToString());
            }
            
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult Edit(QuestionEditViewModel questionViewModel)
        {

            //Zapisuje zmiany w pytaniu do bazy.
            Question question = questionViewModel.Question;
            User user = (User)HttpContext.Session[Typer.Domain.Entities.User.SESSION_KEY];

            if (question.Id == 0)
            {
                question.IsActive = true;
                question.CreatorId = user.UserID;
                question.CreateDate = DateTime.Now;
                service.addQuestion(question);
            }
            else
            {
                service.updateQuestion(question);
            }

            return NavigateToHomePage();

        }





        [HttpGet]
        [AllowAnonymous]
        public ActionResult Add()
        {
            setNavigationPoint();

            Question question = new Question();
            User user = (User)HttpContext.Session[Typer.Domain.Entities.User.SESSION_KEY];

            if (user == null || user.UserID == 0)
                user = new User() { Username = "test", UserID = 1 };

            QuestionEditViewModel questionViewModel = new QuestionEditViewModel(question, user);


            if (questionViewModel != null)
            {
                return View("Edit", questionViewModel);
            }
            else
            {
                return Redirect(Request.Url.ToString());
            }

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

    }
}