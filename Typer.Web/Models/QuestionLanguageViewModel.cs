using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Typer.Domain.Entities;

namespace Typer.Web.Models
{
    public class QuestionLanguageViewModel
    {
        public Question Question { get; set; }
        public Language Language { get; set; }
        private IEnumerable<QuestionOption> options;
        public IEnumerable<QuestionOption> Options
        {
            get
            {
                if (options == null)
                {
                    options = Question.getOptions(Language.Id);
                }
                return options;
            }
        }

        public QuestionLanguageViewModel()
        {
        }

        public QuestionLanguageViewModel(Question question, Language language)
        {
            this.Question = question;
            this.Language = language;
        }

    }
}