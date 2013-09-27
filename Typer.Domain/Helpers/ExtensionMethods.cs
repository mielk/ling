
namespace Typer.Domain.Helpers
{
    public static class ExtensionMethods
    {

        public static bool isNullOrEmpty(this string text)
        {
            return (text == null || text.Length == 0 ? true : false);
        }

    }
}
