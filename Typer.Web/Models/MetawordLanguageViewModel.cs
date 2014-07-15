using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.Web.Models { 

    public class MetawordLanguageViewModel { 

        private readonly Metaword metaword; 
        public int LanguageId; 
        private IEnumerable<Word> words; 
        public IEnumerable<Word> Words { 
            get { return words ?? (words = metaword.GetWords(LanguageId)); }
        } 

        public MetawordLanguageViewModel() { 

        }

        public MetawordLanguageViewModel(Metaword metaword, int languageId)
        {
            this.metaword = metaword;
            LanguageId = languageId; 
        } 
    
    } 

}