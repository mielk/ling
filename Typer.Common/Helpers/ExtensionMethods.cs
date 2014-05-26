using System.Text.RegularExpressions;
using System.Web.Mvc;

namespace Typer.Common.Helpers
{
    public static class ExtensionMethods
    {

        public static bool IsNullOrEmpty(this string text)
        {
            return (string.IsNullOrEmpty(text));
        }

        public static bool IsLegalMail(this string mail)
        {
            const string reg = @"^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$";
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
            if (url.RequestContext.HttpContext.Request.Url == null) return null;
            var scheme = url.RequestContext.HttpContext.Request.Url.Scheme;
            return url.Action(actionName, controllerName, routeValues, scheme);
        }


        public static int ToRange(this int number, int low, int up)
        {
            if (number >= low && number <= up)
            {
                return number;
            }
            return number < low ? low : up;
        }

        public static int CompareEnd(this string text, string compared)
        {
            var chars = 0;
            var originalChars = text.ToCharArray();
            var comparedChars = compared.ToCharArray();

            for (var i = 1; i <= comparedChars.Length; i++)
            {
                if (i >= originalChars.Length) return chars;
                var _base = originalChars[originalChars.Length - i];
                var _compared = comparedChars[comparedChars.Length - i];

                if (_base == _compared)
                {
                    chars++;
                }
                else
                {
                    return chars;
                }
            }

            return chars;

        }

    }
}
