using System.Web.Mvc;
using Typer.Domain.Services;

namespace Typer.Web.Controllers
{
    public class LanguageController : Controller
    {
        
        private readonly ILanguageService service;


        public LanguageController(ILanguageService service)
        {
            this.service = service;
        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetUserLanguages(int userId)
        {
            var languages = service.GetUserLanguages(userId);
            return Json(languages, JsonRequestBehavior.AllowGet);
        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetLanguages()
        {
            var languages = service.GetLanguages();
            return Json(languages, JsonRequestBehavior.AllowGet);
        }


    }
}
