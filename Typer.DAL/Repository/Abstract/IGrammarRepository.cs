using System.Collections.Generic;
using Typer.DAL.TransferObjects;

// ReSharper disable once CheckNamespace


namespace Typer.DAL.Repositories
{
    public interface IGrammarRepository
    {

        IEnumerable<GrammarPropertyDefinitionDto> GetProperties(int[] languages);
        IEnumerable<GrammarPropertyOptionDto> GetOptions(IEnumerable<int> propertiesIds);
        IEnumerable<WordPropertyRequirementDto> GetWordRequiredProperties(int[] languages);

        //IEnumerable<GrammarFormDefinitonDto> GetGrammarFormsDefinitions(int[] languages);
        //IEnumerable<GrammarFormDefinitionPropertyDto> GetGrammarFormsProperties(int[] languages);

        //IEnumerable<int> GetPropertiesIds(int languageId, int wordtypeId);
        //IEnumerable<GrammarPropertyDefinitionDto> GetProperties(IEnumerable<int> ids);
        //IEnumerable<GrammarFormDefinitonDto> GetGrammarDefinitions(int languageId, int wordtypeId);
        //IEnumerable<GrammarPropertyOptionDto> GetGrammarPropertyOptions(int propertyId);
        //GrammarPropertyDefinitionDto GetProperty(int id);
        
    }
}