using System.Collections.Generic;
using System.Linq;
using Typer.DAL.Infrastructure;
using Typer.DAL.Repositories;
using Typer.DAL.TransferObjects;
using Typer.Domain.Entities;

// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public class LanguageService : ILanguageService
    {

        private readonly ILanguageRepository _repository;

        public LanguageService(ILanguageRepository repository)
        {
            _repository = repository ?? RepositoryFactory.GetLanguageRepository();
        }


        public IEnumerable<Language> GetLanguages()
        {
            var dataObjects = _repository.GetLanguages();
            return dataObjects.Select(LanguageFromDto).ToList();
        }

        public Language GetLanguage(int id)
        {
            var dto = _repository.GetLanguage(id);
            return LanguageFromDto(dto);
        }

        public IEnumerable<Language> GetUserLanguages(int userId)
        {
            var dataObjects = _repository.GetUserLanguages(userId);
            return dataObjects.Select(LanguageFromDto).ToList();
        }



        private static Language LanguageFromDto(LanguageDto dto)
        {
            return new Language
            {
                Id = dto.Id,
                Name = dto.Name,
                Flag = dto.Flag
            };
        }

/*
        private static LanguageDto LanguageToDto(Language language)
        {
            return new LanguageDto
            {
                Id = language.Id,
                Name = language.Name
            };
        }
*/


    }
}
