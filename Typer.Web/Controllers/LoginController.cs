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





        //[HttpGet]
        //public ActionResult CheckUser(string username)
        //{
        //    IUserService service = UserServicesFactory.Instance().getUserService();
        //    bool result = service.userExists(username);
        //    return Json(new { IsExisting = result }, JsonRequestBehavior.AllowGet);
        //}

        [HttpPost]
        public ActionResult checkUsername(string username)
        {
            IUserService service = UserServicesFactory.Instance().getUserService();
            string result = service.userExists(username) ? "true" : "false";
            return Json(new { r = result } );
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
