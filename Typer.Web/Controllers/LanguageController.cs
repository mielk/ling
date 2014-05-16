using System.Web.Mvc;
using Typer.Domain.Services;

namespace Typer.Web.Controllers
{
    public class LanguageController : Controller
    {
        
        private readonly ILanguageService _service;


        public LanguageController(ILanguageService service)
        {
            _service = service;
        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetUserLanguages(int userId)
        {
            var languages = _service.GetUserLanguages(userId);
            return Json(languages, JsonRequestBehavior.AllowGet);
        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetLanguages()
        {
            var languages = _service.GetLanguages();
            return Json(languages, JsonRequestBehavior.AllowGet);
        }


    }
}
