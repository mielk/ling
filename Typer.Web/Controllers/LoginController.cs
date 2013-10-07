using System.Web.Mvc;
using System.Web.Security;
using Typer.BLL.Services;
using System.Web.Services;

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
                    return RedirectToAction("Test", "Home");
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
                if (data.isValid())
                {
                    userService.addUser(data);
                    return RedirectToAction("AccountCreated", "Login");
                }
            }

            return View(data);

        }



        
        [HttpPost]
        [AllowAnonymous]
        public ActionResult CheckUsername(string username)
        {
            bool IsExisting = userService.userExists(username);
            return Json(new { IsExisting = IsExisting }, JsonRequestBehavior.AllowGet);
        }

        


        [AllowAnonymous]
        public ActionResult AccountCreated()
        {
            return View();
        }



        #endregion Registration
        //------------------------




    }

}
