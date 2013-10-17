using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Typer.BLL.Services;
using Typer.DAL.Repositories;
using Typer.Domain.Entities;
using Typer.Web.Models;

namespace Typer.Web.Controllers
{
    public class EditController : Controller
    {

        private readonly IQuestionService service;
        public int PageSize = 10;


        public EditController(IQuestionService service)
        {
            this.service = service;
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


        [AllowAnonymous]
        public ActionResult Edit(int id)
        {
            return null;
        }


        [AllowAnonymous]
        public ActionResult Deactivate(int id)
        {
            return null;
            service.deactivate(id);
            return Redirect(Request.UrlReferrer.ToString());
        }


        [AllowAnonymous]
        public ActionResult Activate(int id)
        {
            service.activate(id);
            return Redirect(Request.UrlReferrer.ToString());
        }

    }
}