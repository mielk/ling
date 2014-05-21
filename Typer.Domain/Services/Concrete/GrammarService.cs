using System.Collections.Generic;
using System.Linq;
using Typer.DAL.Infrastructure;
using Typer.DAL.Repositories;
using Typer.DAL.TransferObjects;
using Typer.Domain.Entities;

// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public class GrammarService : IGrammarService
    {

        private readonly IGrammarRepository _repository;
        private static readonly Dictionary<int, Dictionary<int, IEnumerable<GrammarPropertyDefinition>>> WordPropertiesMap =
            new Dictionary<int, Dictionary<int, IEnumerable<GrammarPropertyDefinition>>>();

        public GrammarService(IGrammarRepository repository)
        {
            _repository = repository ?? RepositoryFactory.GetGrammarRepository();
        }



        public IEnumerable<GrammarPropertyDefinition> GetProperties(int[] languages)
        {

            var definitions = _repository.GetProperties(languages);
            var options = _repository.GetOptions(definitions.Select(d => d.Id).ToList());

            return null;

        }




        private GrammarPropertyDefinition PropertyDefinitionFromDto(GrammarPropertyDefinitionDto dto)
        {
            return new GrammarPropertyDefinition
            {
                  Id = dto.Id
                , Name = dto.Name
                , LanguageId = dto.LanguageId
                , Type = dto.Type
                , Default = dto.Default
            };
        }

        private GrammarPropertyOption PropertyOptionFromDto(GrammarPropertyOptionDto dto)
        {
            return new GrammarPropertyOption
            {
                  Id = dto.Id
                , Name = dto.Name
                , PropertyId = dto.PropertyId
                , Value = dto.Value
            };
        }


    }
}