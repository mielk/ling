using System.Linq;
using System.Web.Mvc;
using Typer.Domain.Services;
using Typer.Domain.Entities;
using Typer.Web.Models;

namespace Typer.Web.Controllers
{
    public class QuestionsController : Controller
    {

        private ILanguageService _languageService = LanguageServicesFactory.Instance().getService();
        private readonly IQuestionService _service;
        public int PageSize = 10;
        private RedirectResult NavigationPoint
        {
            get { return Session["EditControllerNavigationPoint"] as RedirectResult; }
            set { Session["EditControllerNavigationPoint"] = value; }
        }



        public QuestionsController(IQuestionService service)
        {
            _service = service;
        }


        private void SetNavigationPoint()
        {
            NavigationPoint = Request.UrlReferrer == null ? null : Redirect(Request.UrlReferrer.ToString());
        }




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



        [AllowAnonymous]
        public ActionResult UpdateWeight(int id, int weight)
        {
            _service.ChangeWeight(id, weight);
            if (Request.UrlReferrer != null) return Redirect(Request.UrlReferrer.ToString());
            return null;
        }


        [AllowAnonymous]
        public ActionResult Deactivate(int id)
        {
            _service.Deactivate(id);
            if (Request.UrlReferrer != null) return Redirect(Request.UrlReferrer.ToString());
            return null;
        }


        [AllowAnonymous]
        public ActionResult Activate(int id)
        {
            _service.Activate(id);
            if (Request.UrlReferrer != null) return Redirect(Request.UrlReferrer.ToString());
            return null;
        }

        #region Helpers
        //Close current subpage and navigate to start page.
        private ActionResult NavigateToHomePage()
        {

            var url = NavigationPoint;

            if (url != null)
            {
                return url;
            }
            return RedirectToAction("Index", "Home");
        }



        [HttpPost]
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
            var user = (User) HttpContext.Session[Domain.Entities.User.SESSION_KEY];
            var question = _service.GetQuestion(id);
            var questionViewModel = new QuestionViewModel(question, 1);//user.UserID);
            return Json(questionViewModel, JsonRequestBehavior.AllowGet);

        }
        

    }
}