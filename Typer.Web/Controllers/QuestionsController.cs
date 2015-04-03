using System.Linq;
using System.Web.Mvc;
using Typer.Domain.Services;
using Typer.Domain.Entities;
using Typer.Web.Models;
using Newtonsoft.Json.Linq;

namespace Typer.Web.Controllers
{
    public class QuestionsController : Controller
    {
        private readonly IQuestionService service;
        public int PageSize = 10;
        // ReSharper disable once UnusedMember.Local
        private RedirectResult NavigationPoint
        {
            get { return Session["EditControllerNavigationPoint"] as RedirectResult; }
            set { Session["EditControllerNavigationPoint"] = value; }
        }



        public QuestionsController(IQuestionService service)
        {
            this.service = service;
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
                Questions = service.GetQuestions().
                OrderBy(q => q.Id).
                Skip((page - 1) * PageSize).
                Take(PageSize),
                PagingInfo = new PagingInfo {
                    CurrentPage = page,
                    ItemsPerPage = PageSize,
                    TotalItems = service.GetQuestions().Count()
                }
            };
            return View(model);

        }





        [HttpGet]
        [AllowAnonymous]
        public ActionResult Filter(int lowWeight, int upWeight, int[] categories, string text, int pageSize, int page)
        {

            var allQuestions = service.Filter(lowWeight, upWeight, categories, text).ToArray();
            var questions = allQuestions.
                OrderBy(q => q.Id).
                Skip((page - 1) * pageSize).
                Take(pageSize);
            var totalItems = allQuestions.Length;

            return Json(new { items = questions, total = totalItems}, JsonRequestBehavior.AllowGet);

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
        public ActionResult UpdateCategories(int[] categories, int id)
        {
            var result = service.UpdateCategories(id, categories);
            return Json(result, JsonRequestBehavior.AllowGet);
        }



        //[HttpPost]
        //[AllowAnonymous]
        //public ActionResult Update(int id, string name, int weight, int[] categories, 
        //    string[] dependencies, string[] connections, string[] editedSets, string[] properties,
        //    string[] editedVariants, string[] addedVariants, string[] limits)
        //{
        //    var result = service.Update(id, name, weight, categories, dependencies, connections, editedSets, properties, editedVariants, addedVariants, limits);
        //    return Json(result);
        //}


        [HttpPost]
        [AllowAnonymous]
        public ActionResult Update(string json)
        {

            var question = new Question(json);
            var result = service.Update(question);
            return Json(result);

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
            var isExisting = service.NameExists(id, name);
            return Json(new { IsExisting = isExisting }, JsonRequestBehavior.AllowGet);
        }

        #endregion


        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetQuestionDetails(int id, int currentUserId)
        {
            var question = service.GetQuestionDetails(id, currentUserId);
            return Json(question, JsonRequestBehavior.AllowGet);
        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetQuestion(int id)
        {
            var user = (User) HttpContext.Session[Domain.Entities.User.SessionKey];
            var question = service.GetQuestion(id);
            var questionViewModel = new QuestionViewModel(question, user.UserID > 0 ? user.UserID : 1);
            return Json(questionViewModel, JsonRequestBehavior.AllowGet);

        }


        [HttpGet]
        [AllowAnonymous]
        public ActionResult GetOptions(int id, int[] languages)
        {
            var options = service.GetOptions(id, languages);
            return Json(options, JsonRequestBehavior.AllowGet);
        }


        //[HttpGet]
        //[AllowAnonymous]
        //public ActionResult GetVariantSets(int id, int[] languages)
        //{
        //    var sets = _service.GetVariantSets(id, languages);
        //    return Json(sets, JsonRequestBehavior.AllowGet);
        //}



        //[HttpGet]
        //[AllowAnonymous]
        //public ActionResult GetVariantSetPropertiesDefinitions(int wordtypeId, int languageId)
        //{
        //    var properties = _service.GetVariantSetPropertiesDefinitions(wordtypeId, languageId);
        //    return Json(properties, JsonRequestBehavior.AllowGet);
        //}

        //[HttpGet]
        //[AllowAnonymous]
        //public ActionResult GetVariantSetPropertiesValues(int id)
        //{
        //    var values = _service.GetVariantSetPropertiesValues(id);
        //    return Json(values, JsonRequestBehavior.AllowGet);
        //}


        //[HttpGet]
        //[AllowAnonymous]
        //public ActionResult GetVariantsForQuestion(int questionId, int[] languages)
        //{
        //    var variants = _service.GetVariantsForQuestion(questionId, languages);
        //    return Json(variants, JsonRequestBehavior.AllowGet);
        //}


        //[HttpGet]
        //[AllowAnonymous]
        //public ActionResult GetVariantsForVariantSet(int variantSetId)
        //{
        //    var variants = _service.GetVariantsForVariantSet(variantSetId);
        //    return Json(variants, JsonRequestBehavior.AllowGet);
        //}

        //[HttpGet]
        //[AllowAnonymous]
        //public ActionResult GetGrammarDefinitionId(int variantSetId)
        //{
        //    var id = _service.GetGrammarDefinitionId(variantSetId);
        //    return Json(id, JsonRequestBehavior.AllowGet);
        //}



        [HttpGet]
        [AllowAnonymous]
        public ActionResult GenerateQuery(int questionId, int baseLanguage, int learnedLanguage)
        {
            Question question = service.GetQuestion(questionId);
            string displayed;
            string[] correct;
            question.loadQuery(baseLanguage, learnedLanguage, out displayed, out correct);

            return Json(new { displayed = displayed, correct = correct }, JsonRequestBehavior.AllowGet);
        }


    }
}