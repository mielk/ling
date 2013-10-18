using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.DAL.Repositories
{
    public interface IQuestionsRepository
    {
        IEnumerable<Question> getQuestions();
        Question getQuestion(int id);
        Question getQuestion(string name);
        bool changeWeight(int id, int weight);
        bool activate(int id);
        bool deactivate(int id);
        bool nameExists(string name);
    }
}