using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Typer.Web.Controllers
{
    public class LoginController : Controller
    {
        //
        // GET: /Login/

        [HttpGet]
        [AllowAnonymous]
        public ActionResult Login()
        {
            return View();
        }

    }

}
