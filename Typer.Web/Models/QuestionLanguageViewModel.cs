using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.Web.Models { 
    public class QuestionLanguageViewModel { 
        private readonly Question _question; 
        public int LanguageId; 
        private IEnumerable<QuestionOption> _options; 
        public IEnumerable<QuestionOption> Options { 
            get { return _options ?? (_options = _question.GetOptions(LanguageId)); }
        } 

        public QuestionLanguageViewModel() { 
        }

        public QuestionLanguageViewModel(Question question, int languageId)
        { 
            _question = question; 
            LanguageId = languageId; 
        } 
    
    } 

}