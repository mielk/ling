using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.Web.Models { 

    public class MetawordLanguageViewModel { 

        private readonly Metaword _metaword; 
        public Language Language; 
        private IEnumerable<Word> _words; 
        public IEnumerable<Word> Words { 
            get { return _words ?? (_words = _metaword.GetWords(Language.Id)); }
        } 

        public MetawordLanguageViewModel() { 

        }

        public MetawordLanguageViewModel(Metaword metaword, Language language)
        {
            _metaword = metaword; 
            Language = language; 
        } 
    
    } 

}