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
            return context.Questions.SingleOrDefault(q => q.Id == id);
        }

        public Question getQuestion(string name)
        {
            return context.Questions.SingleOrDefault(q => q.Name == name);
        }




        #region Update methods.

        public bool updateName(int id, string name)
        {
            Question question = getQuestion(id);
            if (question != null)
            {
                return updateName(question, name);
            }

            return false;
        }

        public bool updateName(Question question, string name)
        {
            try
            {
                question.Name = name;
                context.SaveChanges();
                return true;
            }
            catch (Exception exception)
            {
                return false;
            }
        }

        public bool updateWeight(int id, int weight)
        {
            Question question = getQuestion(id);
            if (question != null)
            {
                return updateWeight(question, weight);
            }

            return false;

        }

        public bool updateWeight(Question question, int weight)
        {
            try
            {
                question.Weight = weight;
                context.SaveChanges();
                return true;
            }
            catch (Exception exception)
            {
                return false;
            }
        }

        public bool updateProperties(int id, string name, int weight)
        {
            Question question = getQuestion(id);
            if (question != null)
            {
                return updateProperties(question, name, weight);
            }

            return false;
        }

        public bool updateProperties(Question question, string name, int weight)
        {
            try
            {
                question.Name = name;
                question.Weight = weight;
                context.SaveChanges();
                return true;
            }
            catch (Exception exception)
            {
                return false;
            }
        }

        #endregion










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


        public bool nameExists(string name)
        {
            Question question = getQuestion(name);
            return (question != null);
        }


        public bool nameExists(int id, string name)
        {
            Question question = getQuestion(name);
            if (question == null || question.Id == id)
            {
                return false;
            }
            else
            {
                return true;
            }

        }


    }
}
