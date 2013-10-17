using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Typer.DAL.Repositories;
using Typer.Domain.Entities;
using Typer.Web.Models;

namespace Typer.Web.Controllers
{
    public class EditController : Controller
    {

        private IQuestionsRepository repository;
        public int PageSize = 10;


        public EditController(IQuestionsRepository repository)
        {
            this.repository = repository;
        }


        [AllowAnonymous]
        public ViewResult List(int page = 1)
        {

            QuestionsListViewModel model = new QuestionsListViewModel {
                Questions = repository.getQuestions().
                OrderBy(q => q.Id).
                Skip((page - 1) * PageSize).
                Take(PageSize),
                PagingInfo = new PagingInfo {
                    CurrentPage = page,
                    ItemsPerPage = PageSize,
                    TotalItems = repository.getQuestions().Count()
                }
            };
            return View(model);

        }


        [AllowAnonymous]
        public ActionResult ChangeWeight(int id, int weight)
        {

            return null;
        }


        [AllowAnonymous]
        public ActionResult Edit(Question question)
        {
            return null;
        }


        [AllowAnonymous]
        public ActionResult Deactivate(Question question)
        {
            return null;
        }


    }
}