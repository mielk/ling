using System;
using System.Globalization;
using System.Text;
using System.Web.Mvc;
using Typer.Web.Models;

namespace Typer.Web.HtmlHelpers
{
    public static class PagingHelpers
    {

        public static MvcHtmlString PageLinks(this HtmlHelper html, PagingInfo pagingInfo, Func<int, string> pageUrl) {
            var result = new StringBuilder();

            for (var i = 1; i <= pagingInfo.TotalPages; i++) {
                var tag = new TagBuilder("a"); // Construct an <a> tag
                tag.MergeAttribute("href", pageUrl(i));
                tag.InnerHtml = i.ToString(CultureInfo.InvariantCulture);

                if (i == pagingInfo.CurrentPage)
                    tag.AddCssClass("selected");

                result.Append(tag);

            }

            return MvcHtmlString.Create(result.ToString());

        }


        public static MvcHtmlString QuestionDisplayer(this HtmlHelper html, string content){
            var result = new StringBuilder();
            var parts = content.Replace("[", "|$").Replace("]", "|").Split('|');

            foreach (var s in parts)
            {
                if (s.Length > 0)
                {
                    result. Append("<span class=\"").
                            Append(s.StartsWith("$") ? "complex" : "plain").
                            Append("\">").
                            Append(s.Replace("$", "")).
                            Append("</span>");
                }
            }

            return MvcHtmlString.Create(result.ToString());

        }


    }
}