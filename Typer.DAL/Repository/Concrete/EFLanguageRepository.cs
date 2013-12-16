using System.Collections.Generic;
using System.Linq;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;

// ReSharper disable once CheckNamespace
namespace Typer.DAL.Repositories
{
    public class EFLanguageRepository : ILanguageRepository
    {

        private static readonly EFDbContext Context = EFDbContext.GetInstance();
        private static readonly IDictionary<int, LanguageDto> Dict = new Dictionary<int, LanguageDto>();


        public IEnumerable<LanguageDto> GetLanguages()
        {
            return Context.Languages;
        }

        public LanguageDto GetLanguage(int id)
        {
            var language = GetLanguageFromDictionary(id);
            if (language != null)
            {
                return language;
            }
            language = Context.Languages.SingleOrDefault(l => l.Id == id);
            if (language == null) return null;
            Dict.Add(id, language);
            return language;
        }


        private static LanguageDto GetLanguageFromDictionary(int id)
        {
            return Dict.ContainsKey(id) ? Dict[id] : null;
        }


        public IEnumerable<LanguageDto> GetUserLanguages(int userId)
        {
            IEnumerable<UserLanguageDto> languageUserObjects = Context.UserLanguages.Where(l => l.UserId == userId);


            //IEnumerable<Language> languages = from l in context.Languages
            //                                  join u in context.UserLanguages
            //                                  on l.Id equals u.LanguageId
            //                                  where u.UserId == userId
            //                                  select new Language
            //                                  {
            //                                      Id = l.Id,
            //                                      Name = l.Name
            //                                  };

            return languageUserObjects.Select(ul => GetLanguage(ul.LanguageId)).ToList();

        }

    }
}
