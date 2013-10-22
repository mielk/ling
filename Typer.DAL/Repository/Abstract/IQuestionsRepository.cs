using System.Collections.Generic;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Repositories
{
    public interface IQuestionsRepository
    {
        IEnumerable<QuestionDto> getQuestions();
        QuestionDto getQuestion(int id);
        QuestionDto getQuestion(string name);

        bool updateName(int id, string name);
        bool updateWeight(int id, int weight);
        bool updateProperties(int id, string name, int weight);

        bool activate(int id);
        bool deactivate(int id);
        bool nameExists(string name);
        bool nameExists(int id, string name);
        
    }
}