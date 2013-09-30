using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Typer.Domain.Entities;
using Typer.BLL.Services;


namespace Typer.Web.Controllers
{
    public class RegistrationController : Controller
    {

        private readonly IUserService userService;


        public RegistrationController(IUserService userService)
        {
            this.userService = userService;
        }



        [HttpGet]
        [AllowAnonymous]
        public ActionResult Registration()
        {
            return View();
        }









    }
}
