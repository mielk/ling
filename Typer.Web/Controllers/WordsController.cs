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

            private readonly IWordService _service;
            public int PageSize = 10;
            private IEnumerable<Metaword> _list;

            // ReSharper disable once UnusedMember.Local
            private RedirectResult NavigationPoint
            {
                get { return Session["EditControllerNavigationPoint"] as RedirectResult; }
                set { Session["EditControllerNavigationPoint"] = value; }
            }




            public WordsController(IWordService service)
            {
                _service = service;
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

                if (_list == null)
                {
                    _list = _service.GetMetawords();
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
                    Metawords = _list.
                    OrderBy(q => q.Id).
                    Skip((page - 1) * PageSize).
                    Take(PageSize),
                    PagingInfo = new PagingInfo
                    {
                        CurrentPage = page,
                        ItemsPerPage = PageSize,
                        TotalItems = _service.GetMetawords().Count()
                    },
                    SearchInfo = searchModel
                };

                return model;

            }





            [HttpGet]
            [AllowAnonymous]
            public ActionResult Filter(int wordType, int lowWeight, int upWeight, int[] categories, string text, int pageSize, int page)
            {

                var allWords = _service.Filter(wordType, lowWeight, upWeight, categories, text).ToArray();
                var words = allWords.
                    OrderBy(w => w.Id).
                    Skip((page - 1) * pageSize).
                    Take(pageSize);
                var totalItems = allWords.Length;

                return Json(new { items = words, total = totalItems}, JsonRequestBehavior.AllowGet);
            }


            [HttpPost]
            [AllowAnonymous]
            public ActionResult UpdateWeight(int id, int weight)
            {
                var result = _service.ChangeWeight(id, weight);
                return Json(result);
                //return Request.UrlReferrer != null ? Redirect(Request.UrlReferrer.ToString()) : null;
            }


            [HttpPost]
            [AllowAnonymous]
            public ActionResult UpdateCategories(int[] categories, int id)
            {
                var result = _service.UpdateCategories(id, categories);
                return Json(result);
            }


            [HttpPost]
            [AllowAnonymous]
            public ActionResult Deactivate(int id)
            {
                var value = _service.Deactivate(id);
                return Json(value, JsonRequestBehavior.AllowGet);
                //return Request.UrlReferrer != null ? Redirect(Request.UrlReferrer.ToString()) : null;
            }


            [HttpPost]
            [AllowAnonymous]
            public ActionResult Activate(int id)
            {
                var value = _service.Activate(id);
                return Json(value, JsonRequestBehavior.AllowGet);
                //return Request.UrlReferrer != null ? Redirect(Request.UrlReferrer.ToString()) : null;
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
                var isExisting = _service.NameExists(id, name);
                return Json(new { IsExisting = isExisting }, JsonRequestBehavior.AllowGet);
            }

            #endregion




            [HttpGet]
            [AllowAnonymous]
            public ActionResult GetMetaword(int id)
            {
                var user = (User)HttpContext.Session[Domain.Entities.User.SessionKey];
                var metaword = _service.GetMetaword(id);
                var metawordViewModel = new MetawordViewModel(metaword, user.UserID > 0 ? user.UserID : 1);
                return Json(metawordViewModel, JsonRequestBehavior.AllowGet);

            }



            //[HttpPost]
            //[AllowAnonymous]
            //public ActionResult GetQuestion(int id)
            //{

            //    QuestionViewModel question = new QuestionViewModel() { Id = 1, Name = "abc", Weight = 8, CreatorId = 1, CreatorName = "xyz", CreateDate = new DateTime(2013, 10, 25) };
            //    return Json(question, JsonRequestBehavior.AllowGet);

            //}


        }
}
