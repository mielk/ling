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
        private readonly IMailSender mailSender;
        private RedirectResult redirectPoint;


        public LoginController(IUserService userService)
        {
            this.userService = userService;
        }


        
        #region Login

        [HttpGet]
        [AllowAnonymous]
        public ActionResult Login()
        {
            redirectPoint = Redirect(Request.UrlReferrer.ToString());
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
                        if (redirectPoint != null)
                        {
                            return redirectPoint;
                        }
                        else
                        {
                            return RedirectToAction("Test", "Home");
                        }
                        //return Redirect(Request.UrlReferrer.ToString());
                        //return 
                    }
                    else
                    {
                        return RedirectToAction("InactiveMail", "Login");
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
                    //return View("AccountCreated", data);
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
        [HttpPost]
        //Close current subpage and navigate to start page.
        public ActionResult NavigateToHomePage()
        {
            return RedirectToAction("Index", "Home");
            //return Redirect(Request.UrlReferrer.ToString());
        }


        #endregion Registration




        #region Email verification.

        [AllowAnonymous]
        [HttpGet]
        public ActionResult InactiveMail()
        {
            return View();
        }


        [AllowAnonymous]
        [HttpPost]
        public ActionResult InactiveMail(UserRegistrationData urd)
        {
            var emailSent = true;//Send e-mail.
            
            if (emailSent){
                return View("MailSent", urd);
            } else {
                return View("ValidationMailSendingError", urd);
            }
        }

        #endregion Email verification.




        #region Generate new password.

        [AllowAnonymous]
        [HttpPost]
        public ActionResult NewPasswordSent()
        {
            return null;
        }


        [AllowAnonymous]
        [HttpGet]
        public ActionResult NewPasswordSendingError()
        {
            return View();
        }

        #endregion Generate new password.


    }

}
