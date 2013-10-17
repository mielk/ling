using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Infrastructure;
using Typer.DAL.Repositories;
using Typer.Domain.Entities;

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




    }
}
