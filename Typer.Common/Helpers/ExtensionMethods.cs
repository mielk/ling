using System.Text.RegularExpressions;

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

    }
}
