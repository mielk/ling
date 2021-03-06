﻿using System.Collections.Generic;
using System.Linq;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;

// ReSharper disable once CheckNamespace
namespace Typer.DAL.Repositories
{
    public class EfGrammarRepository : IGrammarRepository
    {

        private static readonly EFDbContext Context = EFDbContext.GetInstance();

        public IEnumerable<GrammarPropertyDefinitionDto> GetProperties(int[] languages)
        {
            return Context.GrammarPropertyDefinitions.Where(gpd => languages.Contains(gpd.LanguageId)).ToList();
        }

        public IEnumerable<GrammarPropertyOptionDto> GetOptions(IEnumerable<int> propertiesIds)
        {
            return Context.GrammarPropertyOptions.Where(gpo => propertiesIds.Contains(gpo.PropertyId));
        }

        public IEnumerable<WordPropertyRequirementDto> GetWordRequiredProperties(int[] languages)
        {
            return Context.WordPropertyRequirements.Where(wpr => languages.Contains(wpr.LanguageId));
        }

        public IEnumerable<GrammarFormGroupDto> GetGrammarFormGroups(int[] languages)
        {
            return Context.GrammarFormGroups.Where(gfg => languages.Contains(gfg.LanguageId));
        }

        public IEnumerable<GrammarFormDefinitonDto> GetGrammarFormDefinitions(IEnumerable<int> groups)
        {
            return Context.GrammarDefinitions.Where(gfd => groups.Contains(gfd.GroupId));
        }

        public IEnumerable<GrammarFormDefinitionPropertyDto> GetGrammarFormDefinitionsProperties(IEnumerable<int> formsIds)
        {
            return Context.GrammarFormDefinitionProperties.Where(gfdp => formsIds.Contains(gfdp.DefinitionId));
        }

        public IEnumerable<GrammarFormInactiveRuleDto> GetGrammarFormInactiveRules(IEnumerable<int> formsIds)
        {
            return Context.GrammarFormInactiveRules.Where(gfir => formsIds.Contains(gfir.DefinitionId));
        }

        public IEnumerable<DependencyDefinitionDto> GetDependenciesDefinitions(IEnumerable<int> languages)
        {
            return Context.DependenciesDefinitions.Where(dd => languages.Contains(dd.LanguageId));
        }

        //public IEnumerable<GrammarFormDefinitonDto> GetGrammarDefinitions(int languageId, int wordtypeId)
        //{
        //    return Context.GrammarDefinitions.Where(gd => gd.LanguageId == languageId && gd.WordtypeId == wordtypeId);
        //}


        //public IEnumerable<WordtypePropertyValueDto> GetPropertyValues(int wordId)
        //{
        //    return Context.WordtypePropertyValues.Where(wpv => wpv.WordId == wordId);
        //}



        //public IEnumerable<GrammarPropertyOptionDto> GetGrammarPropertyOptions(int propertyId)
        //{
        //    return Context.GrammarPropertyOptions.Where(gpo => gpo.PropertyId == propertyId);
        //}

        //public GrammarPropertyDefinitionDto GetProperty(int id)
        //{
        //    return Context.GrammarPropertyDefinitions.SingleOrDefault(gpd => gpd.Id == id);
        //}

        //public IEnumerable<int> GetPropertiesIds(int languageId, int wordtypeId)
        //{
        //    throw new System.NotImplementedException();
        //}

        //public IEnumerable<GrammarPropertyDefinitionDto> GetProperties(IEnumerable<int> ids)
        //{
        //    return Context.GrammarPropertyDefinitions.Where(gpd => ids.Contains(gpd.Id));
        //}



        //public IEnumerable<GrammarFormDefinitonDto> GetGrammarFormsDefinitions(int[] languages)
        //{
        //    throw new System.NotImplementedException();
        //}

        //public IEnumerable<GrammarFormDefinitionPropertyDto> GetGrammarFormsProperties(int[] languages)
        //{
        //    throw new System.NotImplementedException();
        //}
    }
}