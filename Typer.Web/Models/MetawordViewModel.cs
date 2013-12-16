using System.Collections.Generic;
using System.Linq;
using Typer.Domain.Entities;
using Typer.Domain.Services;

namespace Typer.Web.Models
{
    public class MetawordViewModel
    {

        private readonly ILanguageService _languageService = LanguageServicesFactory.Instance().getService();
        private readonly IWordService _wordService = WordServicesFactory.Instance().getService();
        public Metaword Metaword { get; set; }
        private readonly int _userId;
        public IEnumerable<MetawordLanguageViewModel> UserLanguages { get; set; }
        public IEnumerable<Category> Categories { get; set; }



        public MetawordViewModel(Metaword metaword, int userId)
        {
            Metaword = metaword;
            _userId = userId;
            UserLanguages = GetLanguages();
            Categories = GetCategories(metaword.Id);
        }



        private IEnumerable<Category> GetCategories(int metawordId)
        {
            return _wordService.GetCategories(metawordId);
        }

        private IEnumerable<MetawordLanguageViewModel> GetLanguages()
        {
            if (_userId <= 0) return null;
            var languages = _languageService.getUserLanguages(_userId);

            return languages.Select(language => new MetawordLanguageViewModel(Metaword, language)).ToList();
        }



        public bool IsValid()
        {
            return Metaword != null && _userId > 0;
        }
    }
}
