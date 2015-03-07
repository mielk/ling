using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

            if (ToDo > 0) return;

            ToDo = countQueries();
        }



        private int countQueries()
        {
            const int MAX_QUERIES = 5;

            //Check if it is not the first query for this question.
            if (LastQuery == null) return MAX_QUERIES;

            //Calculate equation's parts.
            double dateDifference = (DateTime.Now - (LastQuery ?? DateTime.Now)).TotalDays;
            double dateDiffFactor = Math.Pow(dateDifference, Question.Weight * 0.6);
            //----
            double averageFactor = (1 - (Counter == 0 ? 0 : CorrectAnswers / Counter)) * 900;
            //---
            double seriesFactor = (50 - (2 * Last50.Count(f => f == '1') - Last50.Length)) * Question.Weight * 2.5;

            double total = ((dateDiffFactor > 300 ? 300 : dateDiffFactor) + averageFactor + (seriesFactor < -100 ? -100 : seriesFactor)) / 200;

            return total > 5 ? 5 : Convert.ToInt32(total);

        }

    }
}
