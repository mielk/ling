using System.Web.Optimization;

// ReSharper disable once CheckNamespace
namespace Typer.Web
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                        "~/Scripts/jquery-ui-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.unobtrusive*",
                        "~/Scripts/jquery.validate*"));

            bundles.Add(new ScriptBundle("~/bundles/global").Include(
                        "~/Scripts/jquery.sizes.js",
                        "~/Scripts/common/util.js",
                        "~/Scripts/app/global.js",
                        "~/Scripts/common/tree.js",
                        "~/Scripts/common/dropdown.js"));

            bundles.Add(new ScriptBundle("~/bundles/notify").Include(
                        "~/Scripts/common/notify.js"));

            bundles.Add(new ScriptBundle("~/bundles/login").Include(
                        "~/Scripts/authentication/login.js"));

            bundles.Add(new ScriptBundle("~/bundles/registration").Include(
                        "~/Scripts/authentication/register.js"));

            bundles.Add(new ScriptBundle("~/bundles/test").Include(
                                    "~/Scripts/question/test.js"));

            bundles.Add(new ScriptBundle("~/bundles/resend").Include(
                        "~/Scripts/authentication/mailValidation.js"));

            bundles.Add(new ScriptBundle("~/bundles/question").Include(
                                    "~/Scripts/question/question.js"));

            bundles.Add(new ScriptBundle("~/bundles/lists").Include(
                                "~/Scripts/lists/ListController.js"));

            bundles.Add(new ScriptBundle("~/bundles/words").Include(
                                    "~/Scripts/question/word.js"));

            bundles.Add(new ScriptBundle("~/bundles/categories").Include(
                                    "~/Scripts/categories/categories.js"));

            bundles.Add(new ScriptBundle("~/bundles/search").Include(
                                                "~/Scripts/question/search.js"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                        "~/Content/normalize.css",
                        "~/Content/site.css"));

            bundles.Add(new StyleBundle("~/Content/categories").Include(
                                    "~/Content/categories.css"));

            bundles.Add(new StyleBundle("~/Content/tree").Include(
                        "~/Content/tree.css"));

            bundles.Add(new StyleBundle("~/Content/word").Include(
                        "~/Content/edit.css",
                        "~/Content/question.css",
                        "~/Content/words.css"));

            bundles.Add(new StyleBundle("~/Content/dropdown").Include(
                                    "~/Content/dropdown.css"));

            bundles.Add(new StyleBundle("~/Content/question").Include(
                                    "~/Content/edit.css",
                                    "~/Content/question.css"));

            bundles.Add(new StyleBundle("~/Content/test").Include(
                        "~/Content/test.css"));

            bundles.Add(new StyleBundle("~/Content/user").Include(
                                    "~/Content/userPanel.css"));

            bundles.Add(new StyleBundle("~/Content/login").Include(
                        "~/Content/login.css"));

            bundles.Add(new StyleBundle("~/Content/themes/base/css").Include(
                        "~/Content/themes/base/jquery.ui.core.css",
                        "~/Content/themes/base/jquery.ui.resizable.css",
                        "~/Content/themes/base/jquery.ui.selectable.css",
                        "~/Content/themes/base/jquery.ui.accordion.css",
                        "~/Content/themes/base/jquery.ui.autocomplete.css",
                        "~/Content/themes/base/jquery.ui.button.css",
                        "~/Content/themes/base/jquery.ui.dialog.css",
                        "~/Content/themes/base/jquery.ui.slider.css",
                        "~/Content/themes/base/jquery.ui.tabs.css",
                        "~/Content/themes/base/jquery.ui.datepicker.css",
                        "~/Content/themes/base/jquery.ui.progressbar.css",
                        "~/Content/themes/base/jquery.ui.theme.css"));
        }
    }
}