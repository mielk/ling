using System.Collections.Generic;
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
                this.repository = RepositoryFactory.GetLanguageRepository();
            }
            else
            {
                this.repository = repository;
            }
        }




        public IEnumerable<Language> getLanguages()
        {
            var dataObjects = repository.getLanguages();
            var languages = new List<Language>();

            foreach (var dto in dataObjects)
            {
                languages.Add(languageFromDto(dto));
            }

            return languages;

        }


        public Language getLanguage(int id)
        {
            var dto = repository.getLanguage(id);
            return languageFromDto(dto);
        }

        public IEnumerable<Language> getUserLanguages(int userId)
        {
            var dataObjects = repository.getUserLanguages(userId);
            var languages = new List<Language>();

            foreach (var dto in dataObjects)
            {
                languages.Add(languageFromDto(dto));
            }

            return languages;

        }



        private Language languageFromDto(LanguageDto dto)
        {
            return new Language
            {
                Id = dto.Id,
                Name = dto.Name
            };
        }

        private LanguageDto languageToDto(Language language)
        {
            return new LanguageDto
            {
                Id = language.Id,
                Name = language.Name
            };
        }


    }
}
