using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web.Mvc;
using Typer.Domain.Services;

namespace Typer.Domain.Entities
{
    public class Metaword
    {

        public const int MinWeight = 1;
        public const int MaxWeight = 10;

        [HiddenInput(DisplayValue = false)]
        public int Id { get; set; }

        [Display(Name = "Name")]
        public string Name { get; set; }

        [Display(Name = "Weight")]
        public int Weight { get; set; }

        [Display(Name = "Type")]
        //public int Type { get; set; }
        public WordType Type { get; set; }

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

        private IEnumerable<Category> _categories;
        public IEnumerable<Category> Categories {
            get
            {
                if (_categories == null) LoadCategories();
                return _categories;
            }

            set
            {
                _categories = value;
            }

        }


        private void LoadCategories()
        {
            _categories = WordServicesFactory.Instance().GetService().GetCategories(Id);
        }

        public Metaword()
        {
            Weight = 1;
        }


        private IEnumerable<Word> _words;
        public IEnumerable<Word> Words
        {
            get
            {
                return _words ?? (_words = WordServicesFactory.Instance().GetService().GetWords(Id));
            }

            set
            {
                _words = value;
            }

        }
        public IEnumerable<Word> GetWords(int languageId)
        {
            return _words.Where(o => o.LanguageId == languageId);
        }

        


    }
}