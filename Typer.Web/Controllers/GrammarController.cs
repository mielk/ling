using System.Web.Mvc;
using Typer.Domain.Services;

namespace Typer.Web.Controllers
{
    public class GrammarController : Controller
    {

        private readonly IGrammarService service;
        


        public GrammarController(IGrammarService service)
        {
            this.service = service;
        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetGrammarProperties(int[] languages)
        {

            var properties = service.GetProperties(languages);
            return Json(properties, JsonRequestBehavior.AllowGet);

        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetWordsRequiredProperties(int[] languages)
        {

            var properties = service.GetWordRequiredProperties(languages);
            return Json(properties, JsonRequestBehavior.AllowGet);
            
        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetGrammarFormGroups(int[] languages)
        {

            var properties = service.GetGrammarFormsDefinitions(languages);
            return Json(properties, JsonRequestBehavior.AllowGet);

        }

    }
}
