using System.Web.Mvc;
using Typer.Domain.Entities;


namespace Typer.Web.Binders
{
    public class UserModelBinder : IModelBinder
    {
        private const string SessionKey = "User";


        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            // get the Cart from the session
            if (controllerContext.HttpContext.Session == null) return null;
            var user = (User)controllerContext.HttpContext.Session[SessionKey];

            // create the Cart if there wasn't one in the session data
            if (user != null) return user;
            user = new User();
            controllerContext.HttpContext.Session[SessionKey] = user;
            // return the cart
            return user;
        }
    }
}