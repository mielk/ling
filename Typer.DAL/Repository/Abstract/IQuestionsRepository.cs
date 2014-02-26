using System.Collections.Generic;
using Typer.DAL.TransferObjects;

// ReSharper disable once CheckNamespace
namespace Typer.DAL.Repositories
{
    public interface IQuestionsRepository
    {
        IEnumerable<QuestionDto> GetQuestions();
        QuestionDto GetQuestion(int id);
        QuestionDto GetQuestion(string name);

        bool AddQuestion(QuestionDto question);

        bool UpdateName(int id, string name);
        bool UpdateWeight(int id, int weight);
        bool UpdateProperties(int id, string name, int weight);
        bool UpdateCategories(int id, int[] categories);
        bool Update(int id, string name, int weight, int[] categories, string[] dependencies, string[] connections, string[] editedSets, string[] properties,
                    string[] editedVariants, string[] addedVariants);

        bool Activate(int id);
        bool Deactivate(int id);
        bool NameExists(string name);
        bool NameExists(int id, string name);

        IEnumerable<QuestionOptionDto> GetOptions(int questionId);
        IEnumerable<QuestionOptionDto> GetOptions(int questionId, int[] languages);
        IEnumerable<QuestionCategoryDto> GetCategories(int metawordId);
        IEnumerable<int> GetQuestionsIdsByCategories(int[] categories);

        //Variants
        IEnumerable<VariantSetDto> GetVariantSets(int questionId);
        IEnumerable<VariantSetDto> GetVariantSets(int questionId, int languageId);
        IEnumerable<VariantSetDto> GetVariantSets(int questionId, int[] languagesIds);
        IEnumerable<VariantDto> GetVariants(int variantSetId);
        IEnumerable<VariantConnectionDto> GetVariantConnections(int[] sets);
        IEnumerable<VariantLimitDto> GetVariantLimits(int questionId);
        IEnumerable<VariantDependencyDto> GetVariantDependencies(int[] sets);
        IEnumerable<DependencyDefinitionDto> GetDependenciesDefinitions(int[] languages);

        IEnumerable<VariantSetPropertyValueDto> GetVariantSetPropertiesValues(int id);
        IEnumerable<VariantSetPropertyDefinitionDto> GetVariantSetPropertiesDefinitions(int wordtypeId, int languageId);
        IEnumerable<VariantDto> GetVariantsForVariantSet(int variantSetId);
        IEnumerable<VariantDto> GetVariantsForQuestion(int questionId, int[] languages);
        int GetGrammarDefinitionId(int variantSetId);
    }
}