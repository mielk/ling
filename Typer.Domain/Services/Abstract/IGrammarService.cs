using System;
using System.Collections.Generic;
using Typer.Domain.Entities;
// ReSharper disable once CheckNamespace


namespace Typer.Domain.Services
{
    public interface IGrammarService
    {

        IEnumerable<GrammarPropertyDefinition> GetProperties(int[] languages);
        IEnumerable<WordPropertyRequirement> GetWordRequiredProperties(int[] languages);
        IEnumerable<GrammarFormGroup> GetGrammarFormsDefinitions(int[] languages);


        //IEnumerable<GrammarFormDefinition> GetGrammarFormsDefinitions(int[] languages);
        //IEnumerable<GrammarFormDefinitionProperty> GetGrammarFormsProperties(int[] languages);

        //IEnumerable<GrammarPropertyOption> GetGrammarPropertyOptions(int propertyId);
        //IEnumerable<GrammarPropertyDefinition> GetProperties(int languageId, int wordtypeId);
        //IEnumerable<GrammarFormDefinition> GetGrammarFormDefinitions(int languageId, int wordtypeId);
        //GrammarPropertyDefinition GetProperty(int id);

    }
}
