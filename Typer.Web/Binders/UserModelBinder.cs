using System.Web.Mvc;
using Typer.Domain.Entities;


namespace Typer.Web.Binders
{
    public class UserModelBinder : IModelBinder
    {
        private const string sessionKey = "User";


        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            // get the Cart from the session
            var user = (User)controllerContext.HttpContext.Session[sessionKey];

            // create the Cart if there wasn't one in the session data
            if (user == null)
            {
                user = new User();
                controllerContext.HttpContext.Session[sessionKey] = user;
            }
            // return the cart
            return user;
        }

    }
}