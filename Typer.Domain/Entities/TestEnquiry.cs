using System;
using System.Collections.Generic;
using System.Linq;

namespace Typer.Domain.Entities
{
    public class TestEnquiry
    {

        //private Question question;
        //private Language learnLanguage;
        //private QuestionOption selectedOption;


        public TestEnquiry(Question question, Language parent, Language learn)
        {
            //this.question = question;
            //learnLanguage = learn;
            //selectedOption = SelectOption(question.GetOptions(parent.Id));

        }


        public string GetQuestionText()
        {
            return "";
        }


        private QuestionOption SelectOption(IEnumerable<QuestionOption> options)
        {

            var optionsArray = options.ToArray();

            if (optionsArray.Count() == 1)
            {
                return optionsArray.Single();
            }

            var weights = optionsArray.Sum(q => q.Weight);
            var randomWeight = new Random().Next(1, weights + 1);
            var current = 0;

            foreach (var option in optionsArray)
            {
                current += option.Weight;
                if (randomWeight <= current)
                {
                    return option;
                }
            }

            return null;

        }



    }
}
