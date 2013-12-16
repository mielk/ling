using System.Web.Mvc;

namespace Typer.Web.Controllers
{
    public class HomeController : Controller
    {

        [AllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }


        public ActionResult Test()
        {
            return View();
        }


    }
}