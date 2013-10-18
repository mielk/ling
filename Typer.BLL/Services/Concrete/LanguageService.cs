using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Infrastructure;
using Typer.DAL.Repositories;
using Typer.Domain.Entities;

namespace Typer.BLL.Services
{
    public class LanguageService : ILanguageService
    {

        private readonly ILanguageRepository repository;

        public LanguageService(ILanguageRepository repository)
        {
            if (repository == null)
            {
                this.repository = RepositoryFactory.getLanguageRepository();
            }
            else
            {
                this.repository = repository;
            }
        }




        public IEnumerable<Language> getLanguages()
        {
            return repository.getLanguages();
        }

        public Language getLanguage(int id)
        {
            return repository.getLanguage(id);
        }

        public IEnumerable<Language> getUserLanguages(int userId)
        {
            return repository.getUserLanguages(userId);
        }

    }
}
