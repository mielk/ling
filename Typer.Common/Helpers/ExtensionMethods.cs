using System.Text.RegularExpressions;
using System.Web.Mvc;

namespace Typer.Common.Helpers
{
    public static class ExtensionMethods
    {

        public static bool isNullOrEmpty(this string text)
        {
            return (text == null || text.Length == 0 ? true : false);
        }

        public static bool isLegalMail(this string mail)
        {
            string reg = @"^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$";
            return Regex.IsMatch(mail.Trim(), reg);
        }


        /// <summary>
        /// Generates a fully qualified URL to an action method by using
        /// the specified action name, controller name and route values.
        /// </summary>
        /// <param name="url">The URL helper.</param>
        /// <param name="actionName">The name of the action method.</param>
        /// <param name="controllerName">The name of the controller.</param>
        /// <param name="routeValues">The route values.</param>
        /// <returns>The absolute URL.</returns>
        public static string AbsoluteAction(this UrlHelper url, string actionName, string controllerName, object routeValues = null)
        {
            string scheme = url.RequestContext.HttpContext.Request.Url.Scheme;
            return url.Action(actionName, controllerName, routeValues, scheme);
        }


    }
}
