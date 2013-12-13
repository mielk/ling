using System.Web.Mvc;
using Typer.Domain.Entities;
using Typer.Domain.Services;

namespace Typer.Web.Controllers
{
    public class CategoriesController : Controller
    {

        private readonly ICategoryService _service;


        public CategoriesController(ICategoryService service)
        {
            _service = service;
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
            var root = _service.GetRoot();
            return Json(root, JsonRequestBehavior.AllowGet);

        }


        [HttpPost]
        [AllowAnonymous]
        public ActionResult UpdateName(int id, string name)
        {
            var result = _service.UpdateName(id, name);
            return Json(result);
        }


        [HttpPost]
        [AllowAnonymous]
        public ActionResult UpdateParentId(int id, int parentId)
        {
            var result = _service.UpdateParent(id, parentId);
            return Json(result);
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult RemoveCategory(int id)
        {
            var result = _service.Deactivate(id);
            return Json(result);
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult AddCategory(string name, int parentId)
        {
            var user = (User) HttpContext.Session[Domain.Entities.User.SESSION_KEY];
            var result = _service.AddCategory(name, parentId, user.UserID);
            return Json(result);
        }


    }
}