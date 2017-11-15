using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.RegularExpressions;
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

        private IEnumerable<QuestionOption> options;
        public IEnumerable<QuestionOption> Options
        {
            get { return options ?? (options = QuestionServicesFactory.Instance().GetService().GetOptions(Id)); }
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



        public Question(string json)
        {
            JToken token = JObject.Parse(json);

            Id = (int)token.SelectToken("Id");
            Name = (string)token.SelectToken("Name");
            Weight = (int)token.SelectToken("Weight");
            WordType = (int)token.SelectToken("WordType");
            IsActive = (bool)token.SelectToken("IsActive");
            IsComplex = (bool)token.SelectToken("IsComplex");
            AskPlural = (bool)token.SelectToken("AskPlural");
            CreatorId = (int)token.SelectToken("CreatorId");
            CreateDate = (DateTime)token.SelectToken("CreateDate");
            categories = Category.GetCollection(token.SelectToken("Categories"));
            options = QuestionOption.GetCollection(token.SelectToken("Options"));

        }


        public IEnumerable<QuestionOption> GetOptions(int languageId)
        {
            return Options.Where(o => o.LanguageId == languageId);
        }

        public List<VariantSet> VariantSets;


        public void loadQuery(int baseLanguage, int learnedLanguage, out string displayed, out string[] correct)
        {
            var selectedOption = drawOption(baseLanguage);

            if (selectedOption == null)
            {
                displayed = string.Empty;
                correct = new string[] { };
                return;
            }

            if (IsComplex)
            {
                displayed = selectedOption.Content;
                correct = new string[] {"a"};
            }
            else
            {

                displayed = selectedOption.Content;
                IList<QuestionOption> correctOptions = GetOptions(learnedLanguage).ToList();
                IList<string> answers = new List<string>();
                IList<string> versions;

                foreach (var option in correctOptions)
                {
                    
                    versions = getOptionVersions(option.Content);

                    foreach (var str in versions)
                    {
                        answers.Add(str);
                    }

                }

                correct = answers.ToArray();

            }

        }

        private IList<string> getOptionVersions(string option)
        {

            bool complete = false;
            IList<string> versions = new List<string>();
            versions.Add(option);

            do
            {
                versions = reduceVersionsLevel(versions, out complete);
            } while (!complete);

            return versions;

        }


        private IList<string> reduceVersionsLevel(IList<string> versions, out bool complete)
        {
            Regex rgx = new Regex("[^a-zA-Z0-9 -]");
            IList<string> result = new List<string>();
            complete = true;

            foreach (var str in versions)
            {

                result.Add(str);
                var part = "";
                
                foreach (char ch in str.ToCharArray())
                {

                    if (ch == '(')
                    {
                        part = "";
                        result.Remove(str);
                    }
                    else if (ch == ')')
                    {
                        IList<string> parts = getVersions(part);
                        string original = '(' + part + ')';

                        foreach (var s in parts)
                        {
                            string converted = rgx.Replace(str.Replace(original, s), "");
                            result.Add(converted);
                        }

                        complete = false;

                    }
                    else
                    {
                        part += ch;
                    }
                }
            }


            return result;

        }


        private IList<string> getVersions(string substring)
        {
            IList<string> versions = substring.Split('/').ToList();

            if (versions.Count == 1)
            {
                versions.Add(string.Empty);
            }

            return versions;
        }


        private QuestionOption drawOption(int baseLanguage)
        {
            IEnumerable<QuestionOption> langOptions = GetOptions(baseLanguage);

            var totalWeight = langOptions.Sum(o => (IsComplex || o.IsMain ? o.Weight : 0));
            var sum = 0;
            var rnd = new Random();

            if (totalWeight == 0) return null;

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