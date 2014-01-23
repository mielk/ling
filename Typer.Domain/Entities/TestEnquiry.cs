using System;
using System.Collections.Generic;
using System.Linq;

namespace Typer.Domain.Entities
{
    public class TestEnquiry
    {

        private Question question;
        private Language parentLanguage;
        private Language learnLanguage;
        private QuestionOption selectedOption;


        public TestEnquiry(Question question, Language parent, Language learn)
        {
            this.question = question;
            parentLanguage = parent;
            learnLanguage = learn;
            selectedOption = selectOption(question.GetOptions(parentLanguage.Id));

        }


        public string GetQuestionText()
        {
            return "";
        }


        private QuestionOption selectOption(IEnumerable<QuestionOption> options)
        {
            if (options.Count() == 1)
            {
                return options.Single();
            }

            var weights = options.Sum(q => q.Weight);
            var randomWeight = new Random().Next(1, weights + 1);
            var current = 0;

            foreach (var option in options)
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
