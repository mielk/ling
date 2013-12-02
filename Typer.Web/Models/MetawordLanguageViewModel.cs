using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Typer.Domain.Entities;

namespace Typer.Web.Models { 

    public class MetawordLanguageViewModel { 

        private Metaword Metaword; 
        public Language Language; 
        private IEnumerable<Word> words; 
        public IEnumerable<Word> Words { 
            get { 
                if (words == null) { 
                    words = Metaword.getWords(Language.Id); 
                } 
                return words;
            } 
        } 

        public MetawordLanguageViewModel() { 

        }

        public MetawordLanguageViewModel(Metaword metaword, Language language)
        {
            Metaword = metaword; 
            Language = language; 
        } 
    
    } 

}