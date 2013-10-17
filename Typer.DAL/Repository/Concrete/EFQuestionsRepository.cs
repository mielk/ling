using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Infrastructure;
using Typer.Domain.Entities;

namespace Typer.DAL.Repositories
{
    public class EFQuestionsRepository : IQuestionsRepository
    {

        private static readonly EFDbContext context = EFDbContext.getInstance();



        public IEnumerable<Question> getQuestions()
        {
            return context.Questions;
        }

        public Question getQuestion(int id)
        {
            return context.Questions.Single(q => q.Id == id);
        }


    }
}
