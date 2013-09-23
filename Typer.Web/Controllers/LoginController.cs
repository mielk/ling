using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Typer.Domain.Entities;
using Typer.Domain.Abstract;
using Typer.Web.Infrastructure;


namespace Typer.Web.Controllers
{
    public class LoginController : Controller
    {

        private IUsersRepository usersRepository;


        public LoginController(IUsersRepository repository)
        {
            usersRepository = repository;
        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult Login()
        {
            return View();
        }





        [HttpPost]
        [AllowAnonymous]
        public ActionResult Login(User _user)
        {
            if (ModelState.IsValid)
            {

                User user = usersRepository.getUser(_user.UserName, _user.Password);
                if (user != null)
                {
                    FormsAuthentication.SetAuthCookie(user.UserName, false);
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    ModelState.AddModelError("", "Login data are incorrect!");
                }

            }

            return View(_user);

        }

    }

}
