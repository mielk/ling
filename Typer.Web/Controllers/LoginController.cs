using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Typer.Domain.Entities;

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

        [HttpPost]
        [AllowAnonymous]
        public ActionResult Login(User user)
        {
            if (ModelState.IsValid)
            {

                try
                {
                    if (user.IsAuthenticated())
                    {
                        FormsAuthentication.SetAuthCookie(user.UserName, false);
                        return RedirectToAction("Index", "Home");
                    }
                    else
                    {
                        ModelState.AddModelError("", "Login data are incorrect!");
                    }
                }
                catch (NullReferenceException exception)
                {
                    ModelState.AddModelError("", "Connection to users repository failed: " + exception.ToString());
                }

            }
            return View(user);
        }

    }

}
