using System.Collections.Generic;
using System.Linq;
using Typer.Domain.Entities;
using Typer.Domain.Services;

namespace Typer.Web.Models
{
    public class QuestionViewModel
    {

        private readonly ILanguageService _languageService = LanguageServicesFactory.Instance().getService();
        private readonly IQuestionService _questionService = QuestionServicesFactory.Instance().getService();
        public Question Question { get; set; }
        private readonly int _userId;
        public IEnumerable<QuestionLanguageViewModel> UserLanguages { get; set; }
        public IEnumerable<Category> Categories { get; set; }


        public QuestionViewModel(Question question, int userId)
        {
            Question = question;
            _userId = userId;
            UserLanguages = GetLanguages();
            Categories = GetCategories(Question.Id);
        }

        private IEnumerable<Category> GetCategories(int questionId)
        {
            return _questionService.GetCategories(questionId);
        }


        private IEnumerable<QuestionLanguageViewModel> GetLanguages()
        {
            if (_userId <= 0) return null;
            var languages = _languageService.getUserLanguages(_userId);
            return languages.Select(language => new QuestionLanguageViewModel(Question, language)).ToList();
        }



        public bool IsValid()
        {
            return Question != null && _userId > 0;
        }
    }
}
