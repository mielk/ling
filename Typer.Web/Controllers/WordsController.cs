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
        public class WordsController : Controller
        {

            private readonly IWordService service;
            public int PageSize = 10;
            private RedirectResult navigationPoint
            {
                get { return Session["EditControllerNavigationPoint"] as RedirectResult; }
                set { Session["EditControllerNavigationPoint"] = value; }
            }



            public WordsController(IWordService service)
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
                MetawordsListViewModel model = new MetawordsListViewModel
                {
                    Metawords = service.getMetawords().
                    OrderBy(q => q.Id).
                    Skip((page - 1) * PageSize).
                    Take(PageSize),
                    PagingInfo = new PagingInfo
                    {
                        CurrentPage = page,
                        ItemsPerPage = PageSize,
                        TotalItems = service.getMetawords().Count()
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
            public ActionResult GetMetaword(int id)
            {
                User user = (User)HttpContext.Session[Typer.Domain.Entities.User.SESSION_KEY];
                Metaword metaword = service.getMetaword(id);
                MetawordViewModel metawordViewModel = new MetawordViewModel(metaword, 1);//user.UserID);
                return Json(metawordViewModel, JsonRequestBehavior.AllowGet);

            }



            //[HttpPost]
            //[AllowAnonymous]
            //public ActionResult GetQuestion(int id)
            //{

            //    QuestionViewModel question = new QuestionViewModel() { Id = 1, Name = "abc", Weight = 8, CreatorId = 1, CreatorName = "xyz", CreateDate = new DateTime(2013, 10, 25) };
            //    return Json(question, JsonRequestBehavior.AllowGet);

            //}


        }
}
