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
        private readonly ILanguageService _languageService = LanguageServicesFactory.Instance().GetService();
        private readonly IUserService _userService;
        private readonly IMailSender _mailSender;
        private RedirectResult NavigationPoint
        {
            get { return Session["LoginControllerNavigationPoint"] as RedirectResult; }
            set { Session["LoginControllerNavigationPoint"] = value; }
        }


        public LoginController(IUserService userService, IMailSender mailSender)
        {
            _userService = userService;
            _mailSender = mailSender;
        }


        private void SetNavigationPoint()
        {
            NavigationPoint = Request.UrlReferrer == null ? null : Redirect(Request.UrlReferrer.ToString());
        }






        
        #region Login

        [HttpGet]
        [AllowAnonymous]
        public ActionResult Login()
        {
            SetNavigationPoint();
            return View();
        }


        [HttpPost]
        [AllowAnonymous]
        public ActionResult Login(UserLoginData data)
        {
            if (!ModelState.IsValid) return View(data);
            var user = _userService.GetUser(data);

            if (user == null)
            {
                ModelState.AddModelError("", "Login or password is incorrect. Please try again.");
            }
            else
            {
                if (!user.MailVerified) return RedirectToAction("InactiveMail", "Login");
                FormsAuthentication.SetAuthCookie(data.Username, false);
                HttpContext.Session[Domain.Entities.User.SessionKey] = user;
                if (NavigationPoint != null)
                {
                    return NavigationPoint;
                }
                return RedirectToAction("Test", "Home");
            }
            return View(data);
        }


        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            HttpContext.Session[Domain.Entities.User.SessionKey] = null;
            return RedirectToAction("Index", "Home");
        }


        #endregion Login
        

        
        #region Registration

        [HttpGet]
        [AllowAnonymous]
        public ActionResult Register()
        {
            SetNavigationPoint();
            return View();
        }


        [HttpPost]
        [AllowAnonymous]
        public ActionResult Register(UserRegistrationData data)
        {
            if (!ModelState.IsValid) return View(data);
            if (!data.IsValid()) return View(data);
            var user = data.ToUser();

            if (!_userService.AddUser(user)) return View("AccountCreationError", user);
            SendConfirmationMail(user);
            return View("AccountCreated", user);
        }


        #endregion



        #region Helpers

        [AllowAnonymous]
        //Close current subpage and navigate to start page.
        public ActionResult NavigateToHomePage()
        {

            var url = NavigationPoint;

            if (url != null)
            {
                return url;
            }
            return RedirectToAction("Index", "Home");
        }


        [HttpPost]
        [AllowAnonymous]
        public ActionResult CheckUsername(string username)
        {
            var isExisting = _userService.UserExists(username);
            return Json(new { IsExisting = isExisting }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult CheckMail(string mail)
        {
            var user = _userService.GetUserByMail(mail);
            var isExisting = (user != null);
            var isVerified = (user != null && user.MailVerified);
            return Json(new
            {
                IsExisting = isExisting,
                IsVerified = isVerified
            }, JsonRequestBehavior.AllowGet);
        }


        private bool SendConfirmationMail(User user)
        {
            return _mailSender.Send(user.Email, "Account created", CreateVerificationMailContent(user));
        }


        private string CreateVerificationMailContent(User user)
        {
            var url = Url.Action("Verify", "Login", new { username = user.Username, token = user.VerificationCode }, "https");
            var content = string.Format(@"We have received the request for account at Typer.com for username {0}<br /><a href=""{1}"">Please click here to activate your account.</a>", user.Username, url);
            return content;
        }


        private bool SendNewPassword(User user)
        {
            var pswd = GeneratePassword(12);
            var encryptedPassword = Sha1.Encode(pswd);

            if (!_userService.ResetPassword(user, encryptedPassword))
                return false;

            return _mailSender.Send(user.Email, "New password", CreatePasswordMailContent(user, pswd));
        }


        private static string GeneratePassword(int length)
        {
            return Guid.NewGuid().ToString().Replace("-", "").Substring(0, length);
        }


        private static string CreatePasswordMailContent(User user, string password)
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

            var user = _userService.GetUserByMail(data.Email);
            var emailSent = SendConfirmationMail(user);

            return View(emailSent ? "MailSent" : "ValidationMailSendingError", user);
        }


        
        [AllowAnonymous]
        public ViewResult Verify(string username, string token)
        {

            var user = _userService.GetUserByName(username);

            if (user == null)
                //User prawdopodobnie został skasowany, bo za długo zwlekał z aktywacją konta.
                return View("AccountDeleted");

            if (token == user.VerificationCode)
            {

                if (_userService.VerifyMail(user.UserID))
                {
                    //Konto zostało aktywowane.
                    //Pokaż ekran z informacją o aktywacji konta.
                    return View("AccountActivated", user);
                }
                
            }

            //Problem podczas weryfikacji konta.
            //Wysłanie jeszcze jednego maila.
            _userService.ResetVerificationCode(user.UserID);
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

            var user = _userService.GetUserByMail(data.Email);
            if (user == null || user.Email != data.Email)
            {
                ViewBag.Message = "User name or password are incorrect";
            }
            else
            {
                if (SendNewPassword(user))
                {
                    return View("ResetPasswordSuccess", user);
                }
                ViewBag.Message = "Please try again in a few minutes";
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