using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Repositories
{
    public class EFLanguageRepository : ILanguageRepository
    {

        private static readonly EFDbContext context = EFDbContext.getInstance();
        private static IDictionary<int, LanguageDto> dict = new Dictionary<int, LanguageDto>();


        public IEnumerable<LanguageDto> getLanguages()
        {
            return context.Languages;
        }

        public LanguageDto getLanguage(int id)
        {
            LanguageDto language = getLanguageFromDictionary(id);
            if (language != null)
            {
                return language;
            }
            else
            {
                language = context.Languages.SingleOrDefault(l => l.Id == id);
                if (language != null)
                {
                    dict.Add(id, language);
                    return language;
                }
            }

            return null;
            
        }


        private LanguageDto getLanguageFromDictionary(int id)
        {
            if (dict.ContainsKey(id))
            {
                return dict[id];
            }

            return null;

        }


        public IEnumerable<LanguageDto> getUserLanguages(int userId)
        {

            List<LanguageDto> languages = new List<LanguageDto>();
            IEnumerable<UserLanguageDto> languageUserObjects = context.UserLanguages.Where(l => l.UserId == userId);

            foreach (UserLanguageDto ul in languageUserObjects)
            {
                languages.Add(getLanguage(ul.LanguageId));
            }


            //IEnumerable<Language> languages = from l in context.Languages
            //                                  join u in context.UserLanguages
            //                                  on l.Id equals u.LanguageId
            //                                  where u.UserId == userId
            //                                  select new Language
            //                                  {
            //                                      Id = l.Id,
            //                                      Name = l.Name
            //                                  };

            return languages;

        }

    }
}
