using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            this.parentLanguage = parent;
            this.learnLanguage = learn;
            this.selectedOption = selectOption(question.getOptions(parentLanguage.Id));

        }


        public string getQuestionText()
        {
            return "";
        }


        private QuestionOption selectOption(IEnumerable<QuestionOption> options)
        {
            if (options.Count() == 1)
            {
                return options.Single();
            }
            else
            {
                int weights = options.Sum(q => q.Weight);
                int randomWeight = new Random().Next(1, weights + 1);
                int current = 0;

                foreach (QuestionOption option in options)
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
}
