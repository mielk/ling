using System.Linq;
using System.Web.Mvc;
using Typer.Domain.Services;
using Typer.Domain.Entities;
using Typer.Web.Models;

namespace Typer.Web.Controllers
{
    public class QuestionsController : Controller
    {
        private readonly IQuestionService _service;
        public int PageSize = 10;
        // ReSharper disable once UnusedMember.Local
        private RedirectResult NavigationPoint
        {
            get { return Session["EditControllerNavigationPoint"] as RedirectResult; }
            set { Session["EditControllerNavigationPoint"] = value; }
        }



        public QuestionsController(IQuestionService service)
        {
            _service = service;
        }


/*
        private void SetNavigationPoint()
        {
            NavigationPoint = Request.UrlReferrer == null ? null : Redirect(Request.UrlReferrer.ToString());
        }
*/




        [AllowAnonymous]
        public ViewResult List(int page = 1)
        {
            var model = new QuestionsListViewModel {
                Questions = _service.GetQuestions().
                OrderBy(q => q.Id).
                Skip((page - 1) * PageSize).
                Take(PageSize),
                PagingInfo = new PagingInfo {
                    CurrentPage = page,
                    ItemsPerPage = PageSize,
                    TotalItems = _service.GetQuestions().Count()
                }
            };
            return View(model);

        }





        [HttpGet]
        [AllowAnonymous]
        public ActionResult Filter(int lowWeight, int upWeight, int[] categories, string text, int pageSize, int page)
        {

            var allQuestions = _service.Filter(lowWeight, upWeight, categories, text).ToArray();
            var questions = allQuestions.
                OrderBy(q => q.Id).
                Skip((page - 1) * pageSize).
                Take(pageSize);
            var totalItems = allQuestions.Length;

            return Json(new { Questions = questions, Total = totalItems}, JsonRequestBehavior.AllowGet);

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

            var url = NavigationPoint;

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
        public ActionResult GetQuestion(int id)
        {
            var user = (User) HttpContext.Session[Domain.Entities.User.SessionKey];
            var question = _service.GetQuestion(id);
            var questionViewModel = new QuestionViewModel(question, user.UserID > 0 ? user.UserID : 1);
            return Json(questionViewModel, JsonRequestBehavior.AllowGet);

        }
        

    }
}