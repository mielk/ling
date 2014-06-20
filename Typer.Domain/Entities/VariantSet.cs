using System;
using System.Collections.Generic;

namespace Typer.Domain.Entities
{
    public class VariantSet
    {

        public int Id { get; set; }
        public int QuestionId { get; set; }
        public int LanguageId { get; set; }
        public string VariantTag { get; set; }
        public int WordType { get; set; }
        public int GrammarFormId { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public List<Variant> Variants { get; set; }
        public List<int> Related { get; set; } 
        public List<int> Dependants { get; set; }
        public int ParentId { get; set; }

        public VariantSet()
        {
            Variants = new List<Variant>();
            Related = new List<int>();
            Dependants = new List<int>();
        }

        public void AddVariant(Variant variant)
        {
            Variants.Add(variant);
        }

        public void AddRelated(VariantSet set)
        {
            Related.Add(set.Id);
        }

        public void AddRelated(int set)
        {
            Related.Add(set);
        }

        public void AddDependant(VariantSet set)
        {
            Dependants.Add(set.Id);
        }

        public void AddDependant(int set)
        {
            Dependants.Add(set);
        }


    }
}