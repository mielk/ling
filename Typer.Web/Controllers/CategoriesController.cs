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


        public CategoriesController(ICategoryService service)
        {
            this.service = service;
        }

        //
        // GET: /Categories/

        [AllowAnonymous]
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


        [HttpPost]
        [AllowAnonymous]
        public ActionResult UpdateName(int id, string name)
        {
            var result = service.updateName(id, name);
            return Json(result);
        }


        [HttpPost]
        [AllowAnonymous]
        public ActionResult UpdateParentId(int id, int parentId)
        {
            var result = service.updateParent(id, parentId);
            return Json(result);
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult RemoveCategory(int id)
        {
            var result = service.deactivate(id);
            return Json(result);
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult AddCategory(string name, int parentId)
        {
            var user = (User) HttpContext.Session[Typer.Domain.Entities.User.SESSION_KEY];
            var result = service.addCategory(name, parentId, user.UserID);
            return Json(result);
        }


    }
}