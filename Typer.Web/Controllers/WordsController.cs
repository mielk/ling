using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Typer.Domain.Services;
using Typer.Domain.Entities;
using Typer.Web.Models;

namespace Typer.Web.Controllers
{
        public class WordsController : Controller
        {

            private readonly IWordService service;
            public int PageSize = 10;
            private IEnumerable<Metaword> list;

            // ReSharper disable once UnusedMember.Local
            private RedirectResult NavigationPoint
            {
                get { return Session["EditControllerNavigationPoint"] as RedirectResult; }
                set { Session["EditControllerNavigationPoint"] = value; }
            }




            public WordsController(IWordService service)
            {
                this.service = service;
            }


/*
            private void SetNavigationPoint()
            {
                navigationPoint = Request.UrlReferrer == null ? null : Redirect(Request.UrlReferrer.ToString());
            }
*/




            [AllowAnonymous]
            public ViewResult List(int page = 1)
            {

                if (list == null)
                {
                    list = service.GetMetawords();
                }

                var model = CreateViewModel(page, new SearchModel{
                        LWeight = 0,
                        UWeight = 0,
                        Contain =  "",
                        WordType = 0,
                        Categories = new List<Category>()
                    });
                return View(model);

            }


            private MetawordsListViewModel CreateViewModel(int page, SearchModel searchModel)
            {
                var model = new MetawordsListViewModel
                {
                    Metawords = list.
                    OrderBy(q => q.Id).
                    Skip((page - 1) * PageSize).
                    Take(PageSize),
                    PagingInfo = new PagingInfo
                    {
                        CurrentPage = page,
                        ItemsPerPage = PageSize,
                        TotalItems = service.GetMetawords().Count()
                    },
                    SearchInfo = searchModel
                };

                return model;

            }





            [HttpGet]
            [AllowAnonymous]
            public ActionResult Filter(int wordtype, int lowWeight, int upWeight, int[] categories, string text, int pageSize, int page)
            {

                var allWords = service.Filter(wordtype, lowWeight, upWeight, categories, text).ToArray();
                var words = allWords.
                    OrderBy(w => w.Id).
                    Skip((page - 1) * pageSize).
                    Take(pageSize);
                var totalItems = allWords.Length;

                return Json(new { items = words, total = totalItems}, JsonRequestBehavior.AllowGet);
            }


            [HttpGet]
            [AllowAnonymous]
            public ActionResult UpdateWeight(int id, int weight)
            {
                var result = service.ChangeWeight(id, weight);
                return Json(result, JsonRequestBehavior.AllowGet);
                //return Request.UrlReferrer != null ? Redirect(Request.UrlReferrer.ToString()) : null;
            }


            [HttpGet]
            [AllowAnonymous]
            public ActionResult Deactivate(int id)
            {
                var value = service.Deactivate(id);
                return Json(value, JsonRequestBehavior.AllowGet);
                //return Request.UrlReferrer != null ? Redirect(Request.UrlReferrer.ToString()) : null;
            }


            [HttpGet]
            [AllowAnonymous]
            public ActionResult Activate(int id)
            {
                var value = service.Activate(id);
                return Json(value, JsonRequestBehavior.AllowGet);
                //return Request.UrlReferrer != null ? Redirect(Request.UrlReferrer.ToString()) : null;
            }





            [HttpGet]
            [AllowAnonymous]
            public ActionResult UpdateCategories(int[] categories, int id)
            {
                var result = service.UpdateCategories(id, categories);
                return Json(result, JsonRequestBehavior.AllowGet);
            }



            [HttpPost]
            [AllowAnonymous]
            public ActionResult Update(string json)
            {
                var metaword = new Metaword(json);
                var result = service.UpdateMetaword(metaword);
                return Json(result);
            }


            [HttpPost]
            [AllowAnonymous]
            public ActionResult Add(string json)
            {
                var metaword = new Metaword(json);
                var id = service.AddMetaword(metaword);
                return Json(id, JsonRequestBehavior.AllowGet);
            }

            #region Helpers
            //Close current subpage and navigate to start page.
/*
            private ActionResult NavigateToHomePage()
            {

                var url = navigationPoint;

                if (url != null)
                {
                    return url;
                }
                return RedirectToAction("Index", "Home");
            }
*/



            [HttpGet]
            [AllowAnonymous]
            public ActionResult CheckName(int id, string name)
            {
                var isExisting = service.NameExists(id, name);
                return Json(new { IsExisting = isExisting }, JsonRequestBehavior.AllowGet);
            }

            #endregion




            [HttpGet]
            [AllowAnonymous]
            public ActionResult GetMetaword(int id)
            {
                var user = (User)HttpContext.Session[Domain.Entities.User.SessionKey];
                var metaword = service.GetMetaword(id);
                var metawordViewModel = new MetawordViewModel(metaword, user.UserID > 0 ? user.UserID : 1);
                return Json(metawordViewModel, JsonRequestBehavior.AllowGet);

            }



            [HttpGet]
            [AllowAnonymous]
            public ActionResult GetWords(int id, int[] languages)
            {
                var words = service.GetWords(id, languages);
                return Json(words, JsonRequestBehavior.AllowGet);
            }



            [HttpGet]
            [AllowAnonymous]
            public ActionResult GetPropertyValues(int wordId)
            {
                var properties = service.GetPropertyValues(wordId);
                return Json(properties, JsonRequestBehavior.AllowGet);
            }


            [HttpGet]
            [AllowAnonymous]
            public ActionResult GetGrammarForms(int wordId)
            {
                var forms = service.GetGrammarForms(wordId);
                return Json(forms, JsonRequestBehavior.AllowGet);
            }


            [HttpGet]
            [AllowAnonymous]
            public ActionResult GetGrammarFormsForWords(int grammarForm, int[] words)
            {
                var forms = service.GetGrammarForms(grammarForm, words);
                return Json(forms, JsonRequestBehavior.AllowGet);
            }


            [HttpGet]
            [AllowAnonymous]
            public ActionResult GetSimilarWords(int languageId, int wordtype, string word)
            {
                var words = service.GetSimilarWords(languageId, wordtype, word);
                return Json(words, JsonRequestBehavior.AllowGet);
            }

        }
}
