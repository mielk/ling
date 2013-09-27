using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using Typer.Domain.Entities;
using Typer.BLL.Services;
using Ninject;
using Typer.DAL.Repositories;

namespace Typer.Web.Controllers
{



    public class LoginController : Controller
    {

        private readonly IUsersRepository _repository;

        public LoginController(IUsersRepository repository)
        {
            _repository = repository;
        }




        [HttpGet]
        [AllowAnonymous]
        public ActionResult Login()
        {

            //IUserService test = userService;
                 

            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult Login(User user)
        {
            if (ModelState.IsValid)
            {

                IUsersRepository ur = _repository;
                FormsAuthentication.SetAuthCookie(user.UserName, false);

                //if (user.IsAuthenticated())
                //{
                //    FormsAuthentication.SetAuthCookie(user.UserName, false);
                //    return RedirectToAction("Index", "Home");
                //}
                //else
                //{
                //    ModelState.AddModelError("", "Login data are incorrect!");
                //}

            }
            return View(user);
        }

    }

}
