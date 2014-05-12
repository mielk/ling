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
                          "~/Scripts/external/select2.js"
                        , "~/Scripts/external/notify.js"
                        , "~/Scripts/external/spin.js"
                        , "~/Scripts/common/internationalization.js"
                        , "~/Scripts/jquery.sizes.js"
                        , "~/Scripts/common/tree.js"
                        , "~/Scripts/common/dropdown.js"
                        , "~/Scripts/common/util.js"                        
                        , "~/Scripts/common/mielk.js"
                        ));

            bundles.Add(new ScriptBundle("~/bundles/search").Include(
                        "~/Scripts/question/search.js"));

            bundles.Add(new ScriptBundle("~/bundles/lists").Include(
                                    "~/Scripts/lists/ListController.js",
                                    "~/Scripts/lists/Variants.js",
                                    "~/Scripts/lists/Options.js"));

            bundles.Add(new ScriptBundle("~/bundles/login").Include(
                        "~/Scripts/authentication/login.js"));

            bundles.Add(new ScriptBundle("~/bundles/registration").Include(
                        "~/Scripts/authentication/register.js"));

            bundles.Add(new ScriptBundle("~/bundles/test").Include(
                                    "~/Scripts/test/test.js"));

            bundles.Add(new ScriptBundle("~/bundles/resend").Include(
                        "~/Scripts/authentication/mailValidation.js"));

            bundles.Add(new ScriptBundle("~/bundles/question").Include(
                                    "~/Scripts/question/question.js"));

            bundles.Add(new ScriptBundle("~/bundles/words").Include(
                                    "~/Scripts/question/word.js"));

            bundles.Add(new ScriptBundle("~/bundles/categories").Include(
                                    "~/Scripts/categories/categories.js"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                        "~/Content/normalize.css"
                        , "~/Content/select2.css"
                        , "~/Content/site.css"
                        , "~/Content/tree.css"
                        , "~/Content/dropdown.css"
                        ));

            bundles.Add(new StyleBundle("~/Content/categories").Include(
                                    "~/Content/categories.css"));

            bundles.Add(new StyleBundle("~/Content/edit").Include(
                        "~/Content/edit.css"));

            bundles.Add(new StyleBundle("~/Content/test").Include(
                        "~/Content/normalize.css",
                        "~/Content/test.css"));

            bundles.Add(new StyleBundle("~/Content/user").Include(
                                    "~/Content/userPanel.css"));

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