using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web.Configuration;
using System.Web.Mvc;
using System.Web.Services.Description;
using Microsoft.Ajax.Utilities;
using Typer.Domain.Services;
using Typer.Domain.Entities;
using Typer.Web.Models;
namespace Typer.Web.Controllers
{
        public class WordsController : Controller
        {

            private readonly IWordService _service;
            private readonly ICategoryService _categoryService = CategoryServicesFactory.Instance().GetService();
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

                if (list == null)
                {
                    list = _service.GetMetawords();
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


            [AllowAnonymous]
            public ViewResult List(SearchModel searchModel, int page = 1)
            {
                if (list == null) list = _service.GetMetawords();
                var model = CreateViewModel(page, searchModel);
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
                        TotalItems = _service.GetMetawords().Count()
                    },
                    SearchInfo = searchModel
                };

                return model;

            }


            [HttpPost]
            [AllowAnonymous]
            public void Filter(int wordType, int lowWeight, int upWeight, int[] categories, string text)
            {

                list = _service.Filter(wordType, lowWeight, upWeight, categories, text);
                SearchModel searchModel = new SearchModel
                {
                    WordType = wordType,
                    LWeight = lowWeight,
                    UWeight = upWeight,
                    Categories = categories.Select(t => _categoryService.GetCategory(t)).ToList(),
                    Contain = text
                };

                var view = List(searchModel, 1);

            }



            [AllowAnonymous]
            public ActionResult UpdateWeight(int id, int weight)
            {
                _service.ChangeWeight(id, weight);
                return Request.UrlReferrer != null ? Redirect(Request.UrlReferrer.ToString()) : null;
            }


            [HttpPost]
            [AllowAnonymous]
            public ActionResult UpdateCategories(int[] categories, int id)
            {
                var result = _service.UpdateCategories(id, categories);
                return Json(result);
            }



            [AllowAnonymous]
            public ActionResult Deactivate(int id)
            {
                _service.Deactivate(id);
                return Request.UrlReferrer != null ? Redirect(Request.UrlReferrer.ToString()) : null;
            }


            [AllowAnonymous]
            public ActionResult Activate(int id)
            {
                _service.Activate(id);
                return Request.UrlReferrer != null ? Redirect(Request.UrlReferrer.ToString()) : null;
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
