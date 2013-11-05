using System.Web;
using System.Web.Optimization;

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
                        "~/Scripts/app/util.js",
                        "~/Scripts/app/global.js"));

            bundles.Add(new ScriptBundle("~/bundles/login").Include(
                        "~/Scripts/app/login.js"));

            bundles.Add(new ScriptBundle("~/bundles/registration").Include(
                        "~/Scripts/app/register.js"));

            bundles.Add(new ScriptBundle("~/bundles/edit").Include(
                                    "~/Scripts/app/edit.js",
                                    "~/Scripts/app/editOptions.js"));

            bundles.Add(new ScriptBundle("~/bundles/test").Include(
                                    "~/Scripts/app/test.js"));

            bundles.Add(new ScriptBundle("~/bundles/resend").Include(
                        "~/Scripts/app/mailValidation.js"));

            bundles.Add(new ScriptBundle("~/bundles/tree").Include(
                        "~/Scripts/app/tree.js"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                        "~/Content/normalize.css",
                        "~/Content/site.css"));

            bundles.Add(new StyleBundle("~/Content/tree").Include(
                        "~/Content/normalize.css",
                        "~/Content/tree.css"));

            bundles.Add(new StyleBundle("~/Content/edit").Include(
                        "~/Content/normalize.css",
                        "~/Content/Edit.css"));

            bundles.Add(new StyleBundle("~/Content/test").Include(
                        "~/Content/normalize.css",
                        "~/Content/Test.css"));

            bundles.Add(new StyleBundle("~/Content/user").Include(
                                    "~/Content/UserPanel.css"));

            bundles.Add(new StyleBundle("~/Content/login").Include(
                        "~/Content/normalize.css",
                        "~/Content/login.css"));

            bundles.Add(new StyleBundle("~/Content/themes/base/css").Include(
                        "~/Content/normalize.css",
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