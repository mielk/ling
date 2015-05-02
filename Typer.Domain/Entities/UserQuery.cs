using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Services;

namespace Typer.Domain.Entities
{
    public class UserQuery
    {
        public int UserID { get; set; }
        public int QuestionID { get; set; }
        public int BaseLanguage { get; set; }
        public int LearnedLanguage { get; set; }
        public string Last50 { get; set; }
        public int Counter { get; set; }
        public int CorrectAnswers { get; set; }
        public DateTime? LastQuery { get; set; }
        public int ToDo { get; set; }
        public Question Question { get; set; }


        public void updateToDo()
        {

            if (ToDo > 0)
            {

                return;

            }

            if (ToDo < 0)
            {
                ToDo = 0;
                return;
            }

            ToDo = countQueries();
        }



        private int countQueries()
        {
            const int MAX_QUERIES = 5;

            //Check if it is not the first query for this question.
            if (LastQuery == null) return MAX_QUERIES;

            //Calculate equation's parts.
            double timeFactor = calculateTimeFactor();
            double doneFactor = calculateDoneFactor();
            double correctFactor = calculateCorrectFactor();

            double total = (timeFactor + doneFactor + correctFactor) / 200;


            //Log it to the database.
            //if (service == null)
            //{
            //    service = QuestionServicesFactory.Instance().GetService();
            //}
            //service.AddToCalculationStepsTable(QuestionID, dateDiffFactor, doneFactor, correctFactor, false, false, total > 5 ? 5 : Convert.ToInt32(total));

            

            return total > 5 ? 5 : Convert.ToInt32(total);

        }


        private double calculateTimeFactor()
        {
            double dateDifference = (DateTime.Now - (LastQuery ?? DateTime.Now)).TotalDays;
            return Math.Min(Math.Pow(dateDifference, 2) * 8 * (1.0d / (double)(11 - Question.Weight)), 400);
        }


        private double calculateDoneFactor()
        {
            return Math.Max((50 - Counter) * 8, -200);
        }


        private double calculateCorrectFactor()
        {
            double allCorrect = (double)CorrectAnswers / (double)Counter;
            double lastCorrect = (double)Last50.Count(f => f == '1') / (double)Last50.Length;
            double weighedCorrect = (allCorrect + 3 * lastCorrect) / 4;
            double shortened = (weighedCorrect - (2.0d / 3.0d)) * 3;

            return (1 - shortened) * 600;

        }

    }
}
