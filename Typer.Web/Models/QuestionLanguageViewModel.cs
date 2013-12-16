using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.Web.Models { 
    public class QuestionLanguageViewModel { 
        private readonly Question _question; 
        public Language Language; 
        private IEnumerable<QuestionOption> _options; 
        public IEnumerable<QuestionOption> Options { 
            get { return _options ?? (_options = _question.GetOptions(Language.Id)); }
        } 

        public QuestionLanguageViewModel() { 
        } 
        
        public QuestionLanguageViewModel(Question question, Language language) { 
            _question = question; 
            Language = language; 
        } 
    
    } 

}