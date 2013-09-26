using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Typer.Domain.Entities;
using Typer.BLL.Services;

namespace Typer.Web.Controllers
{
    public class LoginController : Controller
    {

        private readonly IUserService userService;


        public LoginController(IUserService userService)
        {
            this.userService = userService;
        }



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
            return View(user);
        }

    }

}
