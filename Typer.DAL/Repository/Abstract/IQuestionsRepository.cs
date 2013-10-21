using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.DAL.Repositories
{
    public interface IQuestionsRepository
    {
        IEnumerable<Question> getQuestions();
        Question getQuestion(int id);
        Question getQuestion(string name);

        bool updateName(int id, string name);
        bool updateName(Question question, string name);
        bool updateWeight(int id, int weight);
        bool updateWeight(Question question, int weight);
        bool updateProperties(int id, string name, int weight);
        bool updateProperties(Question question, string name, int weight);

        bool activate(int id);
        bool deactivate(int id);
        bool nameExists(string name);
        bool nameExists(int id, string name);
        
    }
}