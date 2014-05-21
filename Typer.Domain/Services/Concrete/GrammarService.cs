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

        public GrammarService(IGrammarRepository repository)
        {
            _repository = repository ?? RepositoryFactory.GetGrammarRepository();
        }



        public IEnumerable<GrammarPropertyDefinition> GetProperties(int[] languages)
        {

            //Fetch data from the database as DTO objecs.
            var definitions = _repository.GetProperties(languages);
            var options = _repository.GetOptions(definitions.Select(d => d.Id).ToList());

            //Create a dictionary of GrammarPropertyDefinitions.
            var dict = definitions.ToList().Select(PropertyDefinitionFromDto).ToDictionary(definition => definition.Id);

            foreach (var dto in options)
            {
                GrammarPropertyDefinition definition;
                dict.TryGetValue(dto.PropertyId, out definition);
                if (definition != null)
                {
                    definition.AddOption(PropertyOptionFromDto(dto));
                }
            }


            return dict.Values.ToList();

        }


        public IEnumerable<WordPropertyRequirement> GetWordRequiredProperties(int[] languages)
        {
            var properties = _repository.GetWordRequiredProperties(languages);
            return properties.Select(PropertyRequirementFromDto).ToList();
        }




        private static GrammarPropertyDefinition PropertyDefinitionFromDto(GrammarPropertyDefinitionDto dto)
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

        private static GrammarPropertyOption PropertyOptionFromDto(GrammarPropertyOptionDto dto)
        {
            return new GrammarPropertyOption
            {
                  Id = dto.Id
                , Name = dto.Name
                , PropertyId = dto.PropertyId
                , Value = dto.Value
                , Default = dto.Default
            };
        }

        private static WordPropertyRequirement PropertyRequirementFromDto(WordPropertyRequirementDto dto)
        {
            return new WordPropertyRequirement
            {
                  Id = dto.Id
                , LanguageId = dto.LanguageId
                , PropertyId = dto.PropertyId
                , WordtypeId = dto.WordtypeId
            };
        }

    }
}