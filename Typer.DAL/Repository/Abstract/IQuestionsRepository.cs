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
        bool UpdateCategories(int id, IEnumerable<int> categories);
        bool Update(QuestionDto question, IEnumerable<int> languages);
        bool Activate(int id);
        bool Deactivate(int id);
        bool NameExists(string name);
        bool NameExists(int id, string name);

        IEnumerable<QuestionOptionDto> GetOptions(int questionId);
        IEnumerable<QuestionOptionDto> GetOptions(int questionId, IEnumerable<int> languages);
        IEnumerable<QuestionCategoryDto> GetCategories(int metawordId);
        IEnumerable<int> GetQuestionsIdsByCategories(IEnumerable<int> categories);

        //Variants
        IEnumerable<VariantSetDto> GetVariantSets(int questionId);
        IEnumerable<VariantSetDto> GetVariantSets(int questionId, int languageId);
        IEnumerable<VariantSetDto> GetVariantSets(int questionId, IEnumerable<int> languagesIds);
        IEnumerable<VariantDto> GetVariantsForQuestion(int questionId, IEnumerable<int> languages);

        IEnumerable<VariantConnectionDto> GetVariantSetsConnections(int questionId, IEnumerable<int> languages);
        IEnumerable<VariantConnectionDto> GetVariantSetsConnections(IEnumerable<int> sets);

        IEnumerable<VariantDependencyDto> GetVariantSetsDependencies(int questionId, IEnumerable<int> languages);
        IEnumerable<VariantDependencyDto> GetVariantSetsDependencies(IEnumerable<int> sets);

        IEnumerable<VariantLimitDto> GetVariantSetsLimits(int questionId, IEnumerable<int> languages);
        IEnumerable<VariantLimitDto> GetVariantSetsLimits(IEnumerable<int> sets);

        IEnumerable<VariantDto> GetVariants(int questionId, IEnumerable<int> languages);
        IEnumerable<VariantDto> GetVariants(IEnumerable<int> sets);

        IEnumerable<MatchVariantWordDto> GetVariantWordMatching(IEnumerable<int> variants);

        IEnumerable<UserQueryDto> GetUserQueries(int userId, int baseLanguage, int learnedLanguage);
        UserQueryDto GetUserQuery(int questionId, int userId, int baseLanguage, int learnedLanguage);
        bool UpdateQuery(int questionId, int userId, int baseLanguage, int learnedLanguage, int counter, int correct, string last50, int toDo);

    }
}