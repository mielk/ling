using System.Collections.Generic;
using System.Linq;
using Typer.Domain.Entities;
using Typer.Domain.Services;

namespace Typer.Web.Models
{
    public class MetawordViewModel
    {

        private readonly ILanguageService languageService = LanguageServicesFactory.Instance().GetService();
        private readonly IWordService wordService = WordServicesFactory.Instance().GetService();
        public Metaword Metaword { get; set; }
        private readonly int userId;
        public IEnumerable<MetawordLanguageViewModel> UserLanguages { get; set; }
        public IEnumerable<Category> Categories { get; set; }



        public MetawordViewModel(Metaword metaword, int userId)
        {
            Metaword = metaword;
            this.userId = userId;
            UserLanguages = GetLanguages();
            Categories = GetCategories(metaword.Id);
        }



        private IEnumerable<Category> GetCategories(int metawordId)
        {
            var categories = wordService.GetCategories(metawordId);
            return categories;
        }

        private IEnumerable<MetawordLanguageViewModel> GetLanguages()
        {
            if (userId <= 0) return null;
            var languages = languageService.GetUserLanguages(userId);

            return languages.Select(language => new MetawordLanguageViewModel(Metaword, language)).ToList();
        }



        public bool IsValid()
        {
            return Metaword != null && userId > 0;
        }
    }
}
