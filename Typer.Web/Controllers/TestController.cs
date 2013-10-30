using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Typer.Web.Controllers
{
    public class TestController : Controller
    {

        [AllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }

    }
}
