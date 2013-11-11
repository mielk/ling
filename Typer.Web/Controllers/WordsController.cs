using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Typer.Web.Controllers
{
    public class WordsController : Controller
    {

        [AllowAnonymous]
        public ActionResult Index()
        {
            return View();
        }

    }
}
