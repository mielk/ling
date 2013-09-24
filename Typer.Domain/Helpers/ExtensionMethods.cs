using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
