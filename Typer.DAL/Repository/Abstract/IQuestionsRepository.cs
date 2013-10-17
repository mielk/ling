using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.DAL.Repositories
{
    public interface IQuestionsRepository
    {
        IEnumerable<Question> getQuestions();
        Question getQuestion(int id);
        bool changeWeight(int id, int weight);
    }
}