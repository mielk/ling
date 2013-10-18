using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Infrastructure;
using Typer.Domain.Entities;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Repositories
{
    public class EFLanguageRepository : ILanguageRepository
    {

        private static readonly EFDbContext context = EFDbContext.getInstance();


        public IEnumerable<Language> getLanguages()
        {
            return context.Languages;
        }

        public Language getLanguage(int id)
        {
            return context.Languages.SingleOrDefault(l => l.Id == id);
        }

        public IEnumerable<Language> getUserLanguages(int userId)
        {

            IEnumerable<Language> languages = from l in context.Languages
                                              join u in context.UserLanguages
                                              on l.Id equals u.LanguageId
                                              where u.UserId == userId
                                              select new Language {
                                                  Id = l.Id,
                                                  Name = l.Name
                                              };

            return languages;

        }

    }
}
