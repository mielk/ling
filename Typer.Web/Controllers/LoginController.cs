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


        //------------------------
        #region Login

        [HttpGet]
        [AllowAnonymous]
        public ActionResult Login()
        {
            return View();
        }


        [HttpPost]
        [AllowAnonymous]
        public ActionResult Login(UserLoginData data)
        {
            if (ModelState.IsValid)
            {

                if (userService.IsAuthenticated(data))
                {
                    FormsAuthentication.SetAuthCookie(data.Username, false);
                    return RedirectToAction("Logged", "Home");
                }
                else
                {
                    ModelState.AddModelError("", "Login or password is incorrect. Please try again.");
                }

            }
            return View(data);
        }


        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            return RedirectToAction("Index", "Home");
        }

        #endregion Login
        //------------------------



        //------------------------
        #region Registration

        [HttpGet]
        [AllowAnonymous]
        public ActionResult Register()
        {
            return View();
        }


        [HttpPost]
        [AllowAnonymous]
        public ActionResult Register(UserRegistrationData data)
        {
            if (ModelState.IsValid)
            {

            }
            return View(data);
        }




        #endregion Registration
        //------------------------




    }

}
