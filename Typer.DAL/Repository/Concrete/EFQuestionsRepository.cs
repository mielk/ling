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

        public bool changeWeight(int id, int weight)
        {
            Question question = getQuestion(id);
            if (question != null)
            {
                question.Weight = weight;
                context.SaveChanges();
                return true;
            }

            return false;

        }


        public bool activate(int id)
        {
            Question question = getQuestion(id);
            if (question != null)
            {
                if (question.IsActive)
                    return true;

                question.IsActive = true;
                context.SaveChanges();
                return true;
            }

            return false;

        }


        public bool deactivate(int id)
        {
            Question question = getQuestion(id);
            if (question != null)
            {

                if (!question.IsActive)
                    return false;

                question.IsActive = false;
                context.SaveChanges();
                return true;
            }

            return false;

        }


    }
}
