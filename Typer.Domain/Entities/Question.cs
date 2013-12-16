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

        //[Display(Name = "Categories")]
        public string CategoriesString
        {
            get
            {
                var categoriesString = string.Empty;
                var categories = QuestionServicesFactory.Instance().GetService().GetCategories(Id);
                categoriesString = categories.Aggregate(categoriesString, (current, category) => current + ((current.Length > 0 ? " | " : string.Empty) + category.FullPath()));
                return (categoriesString.Length == 0 ? "not assigned" : categoriesString);
            }
        }
    

        public Question()
        {
            Weight = 1;
        }


        private IEnumerable<QuestionOption> _options;
        public IEnumerable<QuestionOption> Options
        {
            get { return _options ?? (_options = QuestionServicesFactory.Instance().GetService().GetOptions(Id)); }
        }
        public IEnumerable<QuestionOption> GetOptions(int languageId)
        {
            return Options.Where(o => o.LanguageId == languageId);
        }

    }
}