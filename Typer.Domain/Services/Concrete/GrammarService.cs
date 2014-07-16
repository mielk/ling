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

        private readonly IGrammarRepository repository;

        public GrammarService(IGrammarRepository repository)
        {
            this.repository = repository ?? RepositoryFactory.GetGrammarRepository();
        }



        public IEnumerable<GrammarPropertyDefinition> GetProperties(int[] languages)
        {

            //Fetch data from the database as DTO objecs.
            var definitions = repository.GetProperties(languages).ToArray();
            var options = repository.GetOptions(definitions.Select(d => d.Id).ToList());

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
            var properties = repository.GetWordRequiredProperties(languages);
            return properties.Select(PropertyRequirementFromDto).ToList();
        }

        public IEnumerable<GrammarFormGroup> GetGrammarFormsDefinitions(int[] languages)
        {
            var groupsDto = repository.GetGrammarFormGroups(languages).ToArray();
            var formsDto = repository.GetGrammarFormDefinitions(groupsDto.Select(g => g.Id)).ToArray();
            var formsIds = formsDto.Select(f => f.Id).ToList();
            var propertiesDto = repository.GetGrammarFormDefinitionsProperties(formsIds);
            var inactiveRulesDto = repository.GetGrammarFormInactiveRules(formsIds);
            //Maps.
            var groupsMap = new Dictionary<int, GrammarFormGroup>();
            var definitionsMap = new Dictionary<int, GrammarFormDefinition>();

            //Convert grammar groups from DTOs to normal objects.
            foreach (var dto in groupsDto)
            {
                var group = GrammarFormGroupFromDto(dto);
                groupsMap.Add(group.Id, group);
            }
            

            //Match grammar forms with groups.
            foreach (var dto in formsDto)
            {
                var form = GrammarFormDefinitionFromDto(dto);
                definitionsMap.Add(form.Id, form);
                //Add to proper group.
                GrammarFormGroup group;
                groupsMap.TryGetValue(form.GroupId, out group);
                if (group != null) group.AddForm(form);
            }

            //Match properties with forms.
            foreach (var dto in propertiesDto)
            {
                var property = GrammarFormDefinitionPropertyFromDto(dto);
                GrammarFormDefinition definition;
                definitionsMap.TryGetValue(property.DefinitionId, out definition);

                if (definition != null) definition.AddProperty(property);


            }


            //Match inactive rules with forms.
            foreach (var dto in inactiveRulesDto)
            {
                var rule = GrammarFormInactiveRuleFromDto(dto);
                GrammarFormDefinition definition;
                definitionsMap.TryGetValue(rule.DefinitionId, out definition);
                if (definition != null) definition.AddInactiveRule(rule);
            }

            return groupsMap.Values.ToList();

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

        private static GrammarFormGroup GrammarFormGroupFromDto(GrammarFormGroupDto dto)
        {
            return new GrammarFormGroup
            {
                Id = dto.Id
                , Index = dto.Index
                , IsHeader = dto.IsHeader
                , Name = dto.Name
                , LanguageId = dto.LanguageId
                , WordtypeId = dto.WordtypeId
            };
        }

        private static GrammarFormDefinition GrammarFormDefinitionFromDto(GrammarFormDefinitonDto dto)
        {
            return new GrammarFormDefinition
            {
                   Id = dto.Id
                 , GroupId = dto.GroupId
                 , Displayed = dto.Displayed
                 , Index = dto.Index
            };
        }

        private static GrammarFormDefinitionProperty GrammarFormDefinitionPropertyFromDto(GrammarFormDefinitionPropertyDto dto)
        {
            return new GrammarFormDefinitionProperty
            {
                  Id = dto.Id
                , DefinitionId = dto.DefinitionId
                , PropertyId = dto.PropertyId
                , ValueId = dto.ValueId
            };
        }

        private static GrammarFormInactiveRule GrammarFormInactiveRuleFromDto(GrammarFormInactiveRuleDto dto)
        {
            return new GrammarFormInactiveRule
            {
                  Id = dto.Id
                , DefinitionId = dto.DefinitionId
                , PropertyId = dto.PropertyId
                , ValueId = dto.ValueId
            };
        }

    }
}