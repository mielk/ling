using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Infrastructure;
using Typer.DAL.Repositories;
using Typer.DAL.TransferObjects;
using Typer.Domain.Entities;

namespace Typer.Domain.Services
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
            IEnumerable<LanguageDto> dataObjects = repository.getLanguages();
            List<Language> languages = new List<Language>();

            foreach (LanguageDto dto in dataObjects)
            {
                languages.Add(languageFromDto(dto));
            }

            return languages;

        }


        public Language getLanguage(int id)
        {
            LanguageDto dto = repository.getLanguage(id);
            return languageFromDto(dto);
        }

        public IEnumerable<Language> getUserLanguages(int userId)
        {
            IEnumerable<LanguageDto> dataObjects = repository.getUserLanguages(userId);
            List<Language> languages = new List<Language>();

            foreach (LanguageDto dto in dataObjects)
            {
                languages.Add(languageFromDto(dto));
            }

            return languages;

        }



        private Language languageFromDto(LanguageDto dto)
        {
            return new Language()
            {
                Id = dto.Id,
                Name = dto.Name
            };
        }

        private LanguageDto languageToDto(Language language)
        {
            return new LanguageDto()
            {
                Id = language.Id,
                Name = language.Name
            };
        }


    }
}
