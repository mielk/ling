using System.Web.Mvc;
using Typer.Domain.Services;

namespace Typer.Web.Controllers
{
    public class GrammarController : Controller
    {

        private readonly IGrammarService _service;
        


        public GrammarController(IGrammarService service)
        {
            _service = service;
        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetGrammarProperties(int[] languages)
        {

            var properties = _service.GetProperties(languages);
            return Json(properties, JsonRequestBehavior.AllowGet);

        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetWordsRequiredProperties(int[] languages)
        {

            var properties = _service.GetWordRequiredProperties(languages);
            return Json(properties, JsonRequestBehavior.AllowGet);
            
        }

    }
}
