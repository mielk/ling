using System.Web.Mvc;
using System.Net;
using System.Net.Mail;
using Typesafe.Mailgun;
using System;
using Typer.Domain.Entities;

namespace Typer.Web.Controllers
{
    public class HomeController : Controller
    {

        [AllowAnonymous]
        public ActionResult Index()
        {
            //var result = sendMail();
            //@ViewBag.Result = result;
            return View();
        }


        //private bool sendMail()
        //{
        //    //var client = new MailgunClient("https://api.mailgun.net/v2", "key-5494yn0jsum8ysjf5ly9bsd762k0d0a5");//https://api.mailgun.net/v2
        //    //client.SendMail(new MailMessage("mielk@o2.pl", "tomasz.mielniczek@elavon.com", "Title", "Test" ));

        //    try
        //    {
        //        SmtpClient mailer = new SmtpClient();
        //        mailer.Send("mielk@o2.pl", "tomasz.mielniczek@o2.pl", "test", "test");
        //        return true;
        //    }
        //    catch (Exception exception)
        //    {
        //        return false;
        //    }


        //}


        public ActionResult Test()
        {
            return View();
        }

        [AllowAnonymous]
        public ActionResult MailInactive()
        {
            return View();
        }


        [AllowAnonymous]
        public ActionResult MailSend(User user)
        {
            return View(user);
        }


    }
}


//MAILGUN_SMTP_LOGIN	    postmaster@app6599.mailgun.org	
//MAILGUN_SMTP_SERVER	    smtp.mailgun.org	
//MAILGUN_API_KEY	        key-5494yn0jsum8ysjf5ly9bsd762k0d0a5	
//MAILGUN_SMTP_PORT	        587	
//MAILGUN_SMTP_PASSWORD	    2injq2mbo038
