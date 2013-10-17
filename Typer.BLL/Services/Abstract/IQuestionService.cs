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
    }
}
