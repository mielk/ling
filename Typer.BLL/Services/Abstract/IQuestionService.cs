using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Entities;

namespace Typer.BLL.Services
{
    public interface IQuestionService
    {
        IEnumerable<Question> getQuestions();
        Question getQuestion(int id);
        bool changeWeight(int id, int weight);
        bool activate(int id);
        bool deactivate(int id);
        bool nameExists(string name);
        bool nameExists(int id, string name);
        bool saveQuestion(Question question);
    }
}
