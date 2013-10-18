using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Infrastructure;
using Typer.DAL.Repositories;
using Typer.Domain.Entities;
using Typer.Common.Helpers;

namespace Typer.BLL.Services
{
    public class QuestionService : IQuestionService
    {


        private readonly IQuestionsRepository repository;

        public QuestionService(IQuestionsRepository repository)
        {
            if (repository == null)
            {
                this.repository = RepositoryFactory.getQuestionsRepository();
            }
            else
            {
                this.repository = repository;
            }
        }



        public IEnumerable<Question> getQuestions()
        {
            return repository.getQuestions();
        }

        public Question getQuestion(int id)
        {
            return repository.getQuestion(id);
        }



        public bool changeWeight(int id, int weight)
        {
            return repository.changeWeight(id, weight.ToRange(Question.MinWeight, Question.MaxWeight));
        }


        public bool activate(int id)
        {
            return repository.activate(id);
        }


        public bool deactivate(int id)
        {
            return repository.deactivate(id);
        }

        public bool nameExists(string name)
        {
            return repository.nameExists(name);
        }



    }
}