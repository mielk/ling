using System;
using System.Web.Mvc;
using System.Web.Security;
using Typer.Domain.Services;
using Typer.Domain.Entities;
using Typer.Common.Helpers;

namespace Typer.Web.Controllers
{

    public class LoginController : Controller
    {
        public const string USER_KEY = "User";
        private readonly IUserService userService;
        private readonly IMailSender mailSender;
        private RedirectResult navigationPoint
        {
            get { return Session["LoginControllerNavigationPoint"] as RedirectResult; }
            set { Session["LoginControllerNavigationPoint"] = value; }
        }


        public LoginController(IUserService userService, IMailSender mailSender)
        {
            this.userService = userService;
            this.mailSender = mailSender;
        }


        private void setNavigationPoint()
        {
            navigationPoint = Request.UrlReferrer == null ? null : Redirect(Request.UrlReferrer.ToString());
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
                        HttpContext.Session[USER_KEY] = user;
                        if (navigationPoint != null)
                        {
                            return navigationPoint;
                        }
                        else
                        {
                            return RedirectToAction("Test", "Home");
                        }
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
            HttpContext.Session[USER_KEY] = null;
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

        [AllowAnonymous]
        //Close current subpage and navigate to start page.
        public ActionResult NavigateToHomePage()
        {

            RedirectResult url = navigationPoint;

            if (url != null)
            {
                return url;
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
            return mailSender.Send(user.Email, "Account created", createVerificationMailContent(user));
        }


        private string createVerificationMailContent(User user)
        {
            string url = this.Url.Action("Verify", "Login", new { username = user.Username, token = user.VerificationCode }, "https");
            string content = string.Format(@"We have received the request for account at Typer.com for username {0}<br /><a href=""{1}"">Please click here to activate your account.</a>", user.Username, url);
            return content;
        }


        private bool sendNewPassword(User user)
        {
            string pswd = generatePassword(12);
            string encryptedPassword = SHA1.Encode(pswd);

            if (!userService.resetPassword(user, encryptedPassword))
                return false;

            if (!mailSender.Send(user.Email, "New password", createPasswordMailContent(user, pswd)))
                return false;

            return true;

        }


        private string generatePassword(int length)
        {
            return Guid.NewGuid().ToString().Replace("-", "").Substring(0, length);
        }


        private string createPasswordMailContent(User user, string password)
        {
            return "Password recovery" + "<br />" + 
                   "User: " + user.Username + "<br />" + 
                   "Password: " + password;
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

        [HttpGet]
        [AllowAnonymous]
        public ActionResult ResetPassword()
        {
            return View();
        }


        [HttpPost]
        [AllowAnonymous]
        public ActionResult ResetPassword(UserRegistrationData data)
        {

            User user = userService.getUserByMail(data.Email);
            if (user == null || user.Email != data.Email)
            {
                ViewBag.Message = "User name or password are incorrect";
            }
            else
            {
                if (sendNewPassword(user))
                {
                    return View("ResetPasswordSuccess", user);
                }
                else
                {
                    ViewBag.Message = "Please try again in a few minutes";
                }
            }

            return View("ResetPasswordError");

        }

        #endregion



        [AllowAnonymous]
        public PartialViewResult Summary(User user)
        {            
            return PartialView(user);
        }
        


    }

}