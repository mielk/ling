using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Typer.Domain.Entities;

namespace Typer.Web.Models
{
    public class TestQuestionViewModel
    {
        public Question Question { get; set; }
        public Language ParentLanguage { get; set; }
        public Language LearnLanguage { get; set; }
        private QuestionOption selectedOption;

        public string getQuestionText()
        {
            IEnumerable<QuestionOption> options = Question.getOptions(ParentLanguage.Id);
            selectedOption = selectOption(options);
            return (selectedOption != null ? selectedOption.Content : "");
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