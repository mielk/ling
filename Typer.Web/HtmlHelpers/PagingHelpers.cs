using System;
using System.Text;
using System.Web.Mvc;
using Typer.Web.Models;

namespace Typer.Web.HtmlHelpers
{
    public static class PagingHelpers
    {

        public static MvcHtmlString PageLinks(this HtmlHelper html, PagingInfo pagingInfo, Func<int, string> pageUrl) {
            StringBuilder result = new StringBuilder();

            for (int i = 1; i <= pagingInfo.TotalPages; i++) {
                TagBuilder tag = new TagBuilder("a"); // Construct an <a> tag
                tag.MergeAttribute("href", pageUrl(i));
                tag.InnerHtml = i.ToString();

                if (i == pagingInfo.CurrentPage)
                    tag.AddCssClass("selected");

                result.Append(tag.ToString());

            }

            return MvcHtmlString.Create(result.ToString());

        }


        public static MvcHtmlString QuestionDisplayer(this HtmlHelper html, string content){
            StringBuilder result = new StringBuilder();
            string[] parts = content.Replace("[", "|$").Replace("]", "|").Split('|');

            foreach (string s in parts)
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