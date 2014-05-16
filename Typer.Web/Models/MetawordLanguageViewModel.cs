using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.Web.Models { 

    public class MetawordLanguageViewModel { 

        private readonly Metaword _metaword; 
        public int LanguageId; 
        private IEnumerable<Word> _words; 
        public IEnumerable<Word> Words { 
            get { return _words ?? (_words = _metaword.GetWords(LanguageId)); }
        } 

        public MetawordLanguageViewModel() { 

        }

        public MetawordLanguageViewModel(Metaword metaword, int languageId)
        {
            _metaword = metaword;
            LanguageId = languageId; 
        } 
    
    } 

}