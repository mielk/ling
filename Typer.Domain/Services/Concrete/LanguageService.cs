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

        private readonly ILanguageRepository repository;

        public LanguageService(ILanguageRepository repository)
        {
            this.repository = repository ?? RepositoryFactory.GetLanguageRepository();
        }


        public IEnumerable<Language> GetLanguages()
        {
            var dataObjects = repository.GetLanguages();
            return dataObjects.Select(LanguageFromDto).ToList();
        }

        public Language GetLanguage(int id)
        {
            var dto = repository.GetLanguage(id);
            return LanguageFromDto(dto);
        }

        public IEnumerable<int> GetUserLanguages(int userId)
        {
            return repository.GetUserLanguages(userId);
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

        public IEnumerable<int> GetCurrentUserLanguages()
        {
            var currentUserId = User.CurrentUserId;
            return GetUserLanguages(currentUserId);
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
