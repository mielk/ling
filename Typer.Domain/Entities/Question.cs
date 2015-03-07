using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web.Mvc;
using Typer.Domain.Services;

namespace Typer.Domain.Entities
{
    public class Question
    {

        public const int MinWeight = 1;
        public const int MaxWeight = 10;

        [HiddenInput(DisplayValue = false)]
        public int Id { get; set; }

        [Display(Name = "Name")]
        public string Name { get; set; }

        [Display(Name = "Weight")]
        public int Weight { get; set; }

        [Display(Name = "Is active")]
        public bool IsActive { get; set; }

        [Display(Name = "Creator")]
        public int CreatorId { get; set; }

        [Display(Name = "Creating date")]
        public DateTime CreateDate { get; set; }

        [Display(Name = "Is approved")]
        public bool IsApproved { get; set; }

        [Display(Name = "Positive votes")]
        public int Positive { get; set; }

        [Display(Name = "Negative votes")]
        public int Negative { get; set; }

        [Display(Name = "Is complex")]
        public bool IsComplex { get; set; }

        [Display(Name = "Ask plural")]
        public bool AskPlural { get; set; }

        [Display(Name = "Word type")]
        public int? WordType { get; set; }

        private IEnumerable<Category> categories;
        public IEnumerable<Category> Categories
        {
            get
            {
                if (categories == null) LoadCategories();
                return categories;
            }
        }


        private void LoadCategories()
        {
            categories = QuestionServicesFactory.Instance().GetService().GetCategories(Id);
        }

        public Question()
        {
            Weight = 1;
            VariantSets = new List<VariantSet>();
        }


        private IEnumerable<QuestionOption> options;
        public IEnumerable<QuestionOption> Options
        {
            get { return options ?? (options = QuestionServicesFactory.Instance().GetService().GetOptions(Id)); }
        }
        public IEnumerable<QuestionOption> GetOptions(int languageId)
        {
            return Options.Where(o => o.LanguageId == languageId);
        }

        public List<VariantSet> VariantSets;


        public void loadQuery(int baseLanguage, int learnedLanguage, out string displayed, out string[] correct)
        {
            var selectedOption = drawOption(baseLanguage);


            if (IsComplex)
            {
                displayed = selectedOption.Content;
                correct = new string[] {"a"};
            }
            else
            {
                displayed = selectedOption.Content;
                IList<QuestionOption> correctOptions = GetOptions(learnedLanguage).ToList();
                var correctAnswers = "";
                
                foreach (var option in correctOptions)
                {
                    correctAnswers += "";
                }

                correct = correctAnswers.Split(';');

            }

        }


        private QuestionOption drawOption(int baseLanguage)
        {
            IEnumerable<QuestionOption> langOptions = GetOptions(baseLanguage);

            var totalWeight = langOptions.Sum(o => (IsComplex || o.IsMain ? o.Weight : 0));
            var sum = 0;
            var rnd = new Random();
            var randomValue = rnd.Next(1, totalWeight);

            foreach (var option in langOptions)
            {
                if (IsComplex || option.IsMain)
                {
                    sum += option.Weight;
                    if (sum >= randomValue)
                    {
                        return option;
                    }
                }
            }

            return null;

        }

    }
}