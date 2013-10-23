using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Repositories
{
    public class EFQuestionsRepository : IQuestionsRepository
    {

        private static readonly EFDbContext context = EFDbContext.getInstance();



        public IEnumerable<QuestionDto> getQuestions()
        {
            return context.Questions;
        }

        public QuestionDto getQuestion(int id)
        {
            return context.Questions.SingleOrDefault(q => q.Id == id);
        }

        public QuestionDto getQuestion(string name)
        {
            return context.Questions.SingleOrDefault(q => q.Name == name);
        }





        public bool addQuestion(QuestionDto question)
        {
            try
            {
                context.Questions.Add(question);
                context.SaveChanges();
                return true;
            }
            catch (Exception exception)
            {
                return false;
            }
        }




        #region Update methods.

        public bool updateName(int id, string name)
        {
            QuestionDto question = getQuestion(id);
            if (question != null)
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

            return false;
        }

        public bool updateWeight(int id, int weight)
        {
            QuestionDto question = getQuestion(id);
            if (question != null)
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

            return false;

        }

        public bool updateProperties(int id, string name, int weight)
        {
            QuestionDto question = getQuestion(id);
            if (question != null)
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

            return false;
        }
        
        #endregion










        public bool activate(int id)
        {
            QuestionDto question = getQuestion(id);
            if (question != null)
            {
                if (question.IsActive)
                    return true;

                try
                {
                    question.IsActive = true;
                    context.SaveChanges();
                    return true;
                }
                catch (Exception exception)
                {
                    return false;
                }

            }

            return false;

        }

        public bool deactivate(int id)
        {
            QuestionDto question = getQuestion(id);
            if (question != null)
            {

                if (!question.IsActive)
                    return false;

                try
                {
                    question.IsActive = false;
                    context.SaveChanges();
                    return true;
                }
                catch (Exception exception)
                {
                    return false;
                }

            }

            return false;

        }


        public bool nameExists(string name)
        {
            int counter = context.Questions.Count(q => q.Name == name);
            return (counter > 0);
        }


        public bool nameExists(int id, string name)
        {
            int counter = context.Questions.Count(q => q.Id == id && q.Name == name);
            return (counter > 0);
        }



        public IEnumerable<QuestionOptionDto> getOptions(int questionId)
        {
            return context.QuestionOptions.Where(o => o.QuestionId == questionId && o.IsActive == true);
        }


    }
}