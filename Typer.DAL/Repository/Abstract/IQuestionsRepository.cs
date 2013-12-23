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
        bool Update(int id, string name, int weight, int[] categories);

        bool Activate(int id);
        bool Deactivate(int id);
        bool NameExists(string name);
        bool NameExists(int id, string name);

        IEnumerable<QuestionOptionDto> GetOptions(int questionId);
        IEnumerable<QuestionCategoryDto> GetCategories(int metawordId);
        IEnumerable<int> GetQuestionsIdsByCategories(int[] categories);

    }
}