using System.Web.Optimization;


// ReSharper disable once CheckNamespace
namespace Typer.Web
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include("~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include("~/Scripts/jquery-ui-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                "~/Scripts/jquery.unobtrusive*",
                "~/Scripts/jquery.validate*"
            ));

            bundles.Add(new ScriptBundle("~/bundles/global").Include(
                  "~/Scripts/external/json2.js"
                , "~/Scripts/external/select2.js"
                , "~/Scripts/external/notify.js"
                , "~/Scripts/external/spin.js"
                , "~/Scripts/jquery.sizes.js"
                , "~/Scripts/common/tree.js"
                , "~/Scripts/common/dropdown.js"
                , "~/Scripts/common/mielk.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/authentication").Include(
                  "~/Scripts/authentication/login.js"
                , "~/Scripts/authentication/mailValidation.js"
                , "~/Scripts/authentication/register.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/app").Include(
                  "~/Scripts/app/common/ling.js"
                , "~/Scripts/app/common/enums.js"
                , "~/Scripts/app/common/internationalization.js"
                , "~/Scripts/app/categories/categories.js"
                , "~/Scripts/app/common/users.js"
                , "~/Scripts/app/common/languages.js"
                //, "~/Scripts/app/common/list/listController.js"
                //, "~/Scripts/app/common/list/list.js"
                //, "~/Scripts/app/queries/variants.js"
                //, "~/Scripts/app/queries/variants3.js"
                //, "~/Scripts/app/queries/options.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/words").Include(
                  "~/Scripts/app/common/list/list.js"
                , "~/Scripts/app/common/list/list-filter-manager.js"
                , "~/Scripts/app/common/list/list-pager.js"
                , "~/Scripts/app/common/list/list-items-manager.js"
                , "~/Scripts/app/common/list/filter-panel.js"
                , "~/Scripts/app/common/list/list-entity.js"
                , "~/Scripts/app/common/list/edit-panel.js"
                , "~/Scripts/app/common/list/edit-word-panel.js"
                , "~/Scripts/app/words/word-list.js"
                , "~/Scripts/app/words/words.js"
                , "~/Scripts/app/words/metaword.js"
                , "~/Scripts/app/words/word.js"
                , "~/Scripts/app/words/grammar.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/queries").Include(
                  "~/Scripts/app/common/list/list.js"
                , "~/Scripts/app/common/list/list-filter-manager.js"
                , "~/Scripts/app/common/list/list-pager.js"
                , "~/Scripts/app/common/list/list-items-manager.js"
                , "~/Scripts/app/common/list/filter-panel.js"
                , "~/Scripts/app/common/list/list-entity.js"
                , "~/Scripts/app/common/list/edit-panel.js"
                , "~/Scripts/app/common/list/edit-query-panel.js"
                , "~/Scripts/app/queries/query-list.js"
                , "~/Scripts/app/queries/queries.js"
                , "~/Scripts/app/queries/query.js"
                , "~/Scripts/app/queries/query-option.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/test").Include(
                  "~/Scripts/app/test/test.js"
            ));


            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include("~/Scripts/modernizr-*"));

            bundles.Add(new StyleBundle("~/bundles/css/css").Include(
                  "~/Content/common/normalize.css"
                , "~/Content/common/select2.css"
                , "~/Content/common/tree.css"
                , "~/Content/common/dropdown.css"
                , "~/Content/common/mielk.css"
            ));

            bundles.Add(new StyleBundle("~/bundles/css/app").Include(
                  "~/Content/app/categories.css"
                , "~/Content/app/edit.css"
                , "~/Content/app/test.css"
                , "~/Content/app/userPanel.css"
                //, "~/Content/app/login.css"
                , "~/Content/app/site.css"
                , "~/Content/app/list.css"
                , "~/Content/app/variants.css"
            ));

            bundles.Add(new StyleBundle("~/bundles/css/themes/base/css").Include(
                  "~/Content/common/normalize.css"
                , "~/Content/themes/base/jquery.ui.core.css"
                , "~/Content/themes/base/jquery.ui.resizable.css"
                , "~/Content/themes/base/jquery.ui.selectable.css"
                , "~/Content/themes/base/jquery.ui.accordion.css"
                , "~/Content/themes/base/jquery.ui.autocomplete.css"
                , "~/Content/themes/base/jquery.ui.button.css"
                , "~/Content/themes/base/jquery.ui.dialog.css"
                , "~/Content/themes/base/jquery.ui.slider.css"
                , "~/Content/themes/base/jquery.ui.tabs.css"
                , "~/Content/themes/base/jquery.ui.datepicker.css"
                , "~/Content/themes/base/jquery.ui.progressbar.css"
                , "~/Content/themes/base/jquery.ui.theme.css"
            ));
        }
    }
}