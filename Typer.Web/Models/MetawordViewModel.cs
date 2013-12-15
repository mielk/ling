using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Entities;
using Typer.Domain.Services;

namespace Typer.Web.Models
{
    public class MetawordViewModel
    {

        private ILanguageService languageService = LanguageServicesFactory.Instance().getService();
        private IWordService wordService = WordServicesFactory.Instance().getService();
        public Metaword Metaword { get; set; }
        private int UserId;
        public IEnumerable<MetawordLanguageViewModel> UserLanguages { get; set; }
        public IEnumerable<Category> Categories { get; set; }



        public MetawordViewModel(Metaword metaword, int userId)
        {
            Metaword = metaword;
            UserId = userId;
            UserLanguages = getLanguages();
            Categories = getCategories(metaword.Id);
        }



        private IEnumerable<Category> getCategories(int metawordId)
        {
            return wordService.getCategories(metawordId);
        }

        private IEnumerable<MetawordLanguageViewModel> getLanguages()
        {
            if (UserId > 0)
            {
                IEnumerable<Language> languages = languageService.getUserLanguages(UserId);
                List<MetawordLanguageViewModel> metawordLanguages = new List<MetawordLanguageViewModel>();

                foreach (Language language in languages)
                {
                    metawordLanguages.Add(new MetawordLanguageViewModel(Metaword, language));
                }

                return metawordLanguages;

            }

            return null;

        }



        public bool isValid()
        {
            if (Metaword != null && UserId > 0)
                return true;

            return false;

        }




    }
}
