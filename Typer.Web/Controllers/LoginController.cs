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

                if (userService.IsAuthenticated(user.UserName, user.Password))
                {
                    FormsAuthentication.SetAuthCookie(user.UserName, false);
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    ModelState.AddModelError("", "Login or password is incorrect. Please try again.");
                }

            }
            return View(user);
        }


        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            return RedirectToAction("Index", "Home");
        }


    }

}
