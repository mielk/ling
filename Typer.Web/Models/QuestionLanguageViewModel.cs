using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.Web.Models { 
    public class QuestionLanguageViewModel { 
        private Question Question; 
        public Language Language; 
        private IEnumerable<QuestionOption> options; 
        public IEnumerable<QuestionOption> Options { 
            get { 
                if (options == null) { 
                    options = Question.getOptions(Language.Id); 
                } 
                return options; 
            } 
        } 

        public QuestionLanguageViewModel() { 
        } 
        
        public QuestionLanguageViewModel(Question question, Language language) { 
            Question = question; 
            Language = language; 
        } 
    
    } 

}