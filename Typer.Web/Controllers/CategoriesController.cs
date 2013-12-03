using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Typer.Domain.Entities;
using Typer.Domain.Services;

namespace Typer.Web.Controllers
{
    public class CategoriesController : Controller
    {

        private readonly ICategoryService service;

        //
        // GET: /Categories/

        public ActionResult Index()
        {
            return View();
        }



        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetCategories()
        {
            Category root = service.getRoot();
            return Json(root, JsonRequestBehavior.AllowGet);

        }
                


    }
}