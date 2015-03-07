using System.Collections.Generic;
using Typer.Domain.Entities;

// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public interface IQuestionService
    {
        IEnumerable<Question> GetQuestions();
        Question GetQuestion(int id);
        Question GetQuestionDetails(int id, int currentUserId);
                 
        bool ChangeWeight(int id, int weight);
        bool Activate(int id);
        bool Deactivate(int id);
        bool NameExists(string name);
        bool NameExists(int id, string name);
        bool UpdateQuestion(Question question);
        bool UpdateCategories(int id, int[] categories);
        bool Update(int id, string name, int weight, int[] categories, string[] dependencies, string[] connections, string[] editedSets, string[] properties,
                    string[] editedVariants, string[] addedVariants, string[] limits);
        bool AddQuestion(Question question);
        IEnumerable<QuestionOption> GetOptions(int questionId);
        IEnumerable<QuestionOption> GetOptions(int questionId, int[] languages);
        IEnumerable<Category> GetCategories(int questionId);
        IEnumerable<Question> Filter(int lowWeight, int upWeight, int[] categories, string text);
        IEnumerable<UserQuery> GetQueries(int userId, int baseLanguage, int learnedLanguage);
        bool SaveAnswer(int questionId, int userId, int baseLanguage, int learnedLanguage, int counter, int correct, string last50, int toDo);

        //Variants
        //IEnumerable<VariantSet> GetVariantSets(int questionId, int[] languages);
        //IEnumerable<Variant> GetVariants(int variantSetId);
        //IEnumerable<VariantSet> GetVariantSetsWithDetails(int questionId);
        //IEnumerable<VariantSet> GetVariantSetsWithDetails(int questionId, int languageId);
        //IEnumerable<VariantSet> GetVariantSetsWithDetails(int questionId, int[] languagesIds);
        //IEnumerable<Variant> GetVariants(int questionId, int languageId);
        //IEnumerable<Variant> GetVariants(int questionId, int[] languagesIds);
        //IEnumerable<Variant> GetVariantsWithDetails(int variantSetId);
        //IEnumerable<Variant> GetVariantsWithDetails(int questionId, int languageId);
        //IEnumerable<Variant> GetVariantsWithDetails(int questionId, int[] languagesIds);

        //IEnumerable<VariantSetPropertyDefinition> GetVariantSetPropertiesDefinitions(int wordtypeId, int languageId);
        //IEnumerable<VariantSetPropertyValue> GetVariantSetPropertiesValues(int id);
        //IEnumerable<Variant> GetVariantsForQuestion(int questionId, int[] languages);
        //IEnumerable<Variant> GetVariantsForVariantSet(int variantSetId);
        //int GetGrammarDefinitionId(int variantSetId);
    }
}