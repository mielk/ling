using System.Web.Mvc;
using System.Web.Security;
using System.Web.Services;
using Typer.BLL.Services;
using Typer.Domain.Entities;
using Typer.Common.Helpers;


namespace Typer.Web.Controllers
{

    public class LoginController : Controller
    {

        private readonly IUserService userService;
        private readonly IMailSender mailSender;
        private RedirectResult navigationPoint;


        public LoginController(IUserService userService, IMailSender mailSender)
        {
            this.userService = userService;
            this.mailSender = mailSender;
        }

        private void setNavigationPoint()
        {
            navigationPoint = Redirect(Request.UrlReferrer.ToString());
        }






        
        #region Login

        [HttpGet]
        [AllowAnonymous]
        public ActionResult Login()
        {
            setNavigationPoint();
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
                        if (navigationPoint != null)
                        {
                            return navigationPoint;
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
            setNavigationPoint();
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

                    User user = data.toUser();

                    if (userService.addUser(user))
                    {
                        sendConfirmationMail(user);
                        return View("AccountCreated", user);
                    }
                    else
                    {
                        return View("AccountCreationError", user);
                    }
                }
            }

            return View(data);

        }


        #endregion




        #region Helpers

        [HttpPost]
        [AllowAnonymous]
        //Close current subpage and navigate to start page.
        public ActionResult NavigateToHomePage()
        {

            if (navigationPoint != null)
            {
                return navigationPoint;
            }
            else
            {
                return RedirectToAction("Index", "Home");
            }

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
            return Json(new
            {
                IsExisting = isExisting,
                IsVerified = isVerified
            }, JsonRequestBehavior.AllowGet);
        }


        private bool sendConfirmationMail(User user)
        {
            return mailSender.Send(user.Email, "Account created", createMailContent(user));
        }


        private string createMailContent(User user)
        {
            string url = this.Url.AbsoluteAction("Verify", "Login") + "/?" +
                        @"username=" + user.UserName + @"&token=" + user.VerificationCode;
            string content = string.Format(@"<a href=""{0}"">Click here to activate your account.</a>", url);
            return content;
        }

        #endregion




        #region Email verification

        [AllowAnonymous]
        [HttpGet]
        public ActionResult InactiveMail()
        {
            return View();
        }


        [AllowAnonymous]
        [HttpPost]
        public ActionResult InactiveMail(UserRegistrationData data)
        {

            User user = userService.getUserByMail(data.Email);
            var emailSent = sendConfirmationMail(user);
            
            if (emailSent){
                return View("MailSent", user);
            } else {
                return View("ValidationMailSendingError", user);
            }
        }


        
        [AllowAnonymous]
        public ViewResult Verify(string username, string token)
        {

            User user = userService.getUserByName(username);

            if (user == null)
                //User prawdopodobnie został skasowany, bo za długo zwlekał z aktywacją konta.
                return View("AccountDeleted");

            if (token == user.VerificationCode)
            {

                if (userService.verifyMail(user.UserID))
                {
                    //Konto zostało aktywowane.
                    //Pokaż ekran z informacją o aktywacji konta.
                    return View("AccountActivated", user);
                }
                
            }

            //Problem podczas weryfikacji konta.
            //Wysłanie jeszcze jednego maila.
            userService.resetVerificationCode(user.UserID);
            return View("AccountActivationError", user);

        }


        #endregion Email verification








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
