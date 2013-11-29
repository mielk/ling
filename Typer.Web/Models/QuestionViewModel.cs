using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Entities;
using Typer.Domain.Services;

namespace Typer.Web.Models
{
    public class QuestionViewModel
    {

        private ILanguageService languageService = LanguageServicesFactory.Instance().getService();
        public Question Question { get; set; }
        private int UserId;
        public IEnumerable<QuestionLanguageViewModel> UserLanguages { get; set; }


        public QuestionViewModel(Question question, int userId)
        {
            Question = question;
            UserId = userId;
            UserLanguages = getLanguages();
        }



        private IEnumerable<QuestionLanguageViewModel> getLanguages()
        {
            if (UserId > 0)
            {
                IEnumerable<Language> languages = languageService.getUserLanguages(UserId);
                List<QuestionLanguageViewModel> questionLanguages = new List<QuestionLanguageViewModel>();

                foreach (Language language in languages)
                {
                    questionLanguages.Add(new QuestionLanguageViewModel(Question, language));
                }

                return questionLanguages;

            }

            return null;

        }



        public bool isValid()
        {
            if (Question != null && UserId > 0)
                return true;

            return false;

        }




    }
}
