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
            return View();
        }


        public ActionResult Test()
        {
            return View();
        }


    }
}