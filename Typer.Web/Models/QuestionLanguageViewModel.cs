using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.Web.Models { 
    public class QuestionLanguageViewModel { 
        private readonly Question question; 
        public int LanguageId; 
        private IEnumerable<QuestionOption> options; 
        public IEnumerable<QuestionOption> Options { 
            get { return options ?? (options = question.GetOptions(LanguageId)); }
        } 

        public QuestionLanguageViewModel() { 
        }

        public QuestionLanguageViewModel(Question question, int languageId)
        { 
            this.question = question; 
            LanguageId = languageId; 
        } 
    
    } 

}