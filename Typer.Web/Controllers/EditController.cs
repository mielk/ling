using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Typer.BLL.Services;
using Typer.DAL.Repositories;
using Typer.Domain.Entities;
using Typer.Domain.ViewModels;
using Typer.Web.Models;

namespace Typer.Web.Controllers
{
    public class EditController : Controller
    {

        private readonly IQuestionService service;
        private RedirectResult navigationPoint;
        public int PageSize = 10;


        public EditController(IQuestionService service)
        {
            this.service = service;
        }


        private void setNavigationPoint()
        {
            if (Request.UrlReferrer != null)
            {
                navigationPoint = Redirect(Request.UrlReferrer.ToString());
            }
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
        public ActionResult ChangeWeight(int id, int weight)
        {
            service.changeWeight(id, weight);
            return Redirect(Request.UrlReferrer.ToString());
        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult Edit(int id)
        {

            setNavigationPoint();

            QuestionEditViewModel question = new QuestionEditViewModel()
            {
                Question = service.getQuestion(id),
                User = (User)HttpContext.Session[LoginController.USER_KEY]
            };
            

            if (question != null && question.isValid()){
                return View(question);
            } else {
                return Redirect(Request.Url.ToString());
            }
            
        }


        [HttpPost]
        [AllowAnonymous]
        public ActionResult Edit(QuestionEditViewModel question)
        {

            //Zapisuje zmiany w pytaniu do bazy.



            return NavigateToHomePage();
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

            if (navigationPoint != null)
            {
                return navigationPoint;
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