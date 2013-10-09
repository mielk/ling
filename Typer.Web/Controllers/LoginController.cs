using System.Web.Mvc;
using System.Web.Security;
using Typer.BLL.Services;
using System.Web.Services;
using Typer.Domain.Entities;

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

                User user = userService.getUser(data);

                if (user == null)
                {
                    ModelState.AddModelError("", "Login or password is incorrect. Please try again.");
                }
                else
                {

                    if (user.MailVerified)
                    {
                        FormsAuthentication.SetAuthCookie(data.Username, false);
                        return RedirectToAction("Test", "Home");
                    }
                    else
                    {
                        return RedirectToAction("MailInactive", "Login");
                    }

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
            bool isExisting = userService.userExists(username);
            return Json(new { IsExisting = isExisting }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult CheckMail(string mail)
        {
            User user = userService.getUserByMail(mail);
            bool isExisting = (user == null ? false : true);
            bool isVerified = (user == null ? false : user.MailVerified);
            return Json(new { 
                IsExisting = isExisting, 
                IsVerified = isVerified
            }, JsonRequestBehavior.AllowGet);
        }
        


        [AllowAnonymous]
        public ActionResult AccountCreated()
        {
            return View();
        }


        [AllowAnonymous]
        public ActionResult MailInactive()
        {
            return View();
        }



        #endregion Registration
        //------------------------




    }

}
