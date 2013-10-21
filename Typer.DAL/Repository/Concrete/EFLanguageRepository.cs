using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;
using Typer.Domain.Entities;

namespace Typer.DAL.Repositories
{
    public class EFLanguageRepository : ILanguageRepository
    {

        private static readonly EFDbContext context = EFDbContext.getInstance();
        private static IDictionary<int, Language> dict = new Dictionary<int, Language>();


        public IEnumerable<Language> getLanguages()
        {
            return context.Languages;
        }

        public Language getLanguage(int id)
        {
            Language language = getLanguageFromDictionary(id);
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


        private Language getLanguageFromDictionary(int id)
        {
            if (dict.ContainsKey(id))
            {
                return dict[id];
            }

            return null;

        }


        public IEnumerable<Language> getUserLanguages(int userId)
        {

            List<Language> languages = new List<Language>();
            IEnumerable<UserLanguage> languageUserObjects = context.UserLanguages.Where(l => l.UserId == userId);

            foreach (UserLanguage ul in languageUserObjects)
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
