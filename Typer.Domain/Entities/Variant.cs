using System;
using System.Collections.Generic;

namespace Typer.Domain.Entities
{
    public class Variant
    {

        public int Id { get; set; }
        public int VariantSetId { get; set; }
        public string Key { get; set; }
        public string Content { get; set; }
        public int WordId { get; set; }
        public bool IsAnchored { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Negative { set; get; }
        public int Positive { get; set; }
        public List<string> Excluded { get; set; }
        public IEnumerable<int> Words { get; set; }

        public Variant()
        {
            Excluded = new List<string>();
            Words = new List<int>();
        }

        public void AddExcluded(Variant variant)
        {
            Excluded.Add(variant.VariantSetId + "|" + variant.Id);   
        }

        public void AddWord(int word)
        {
            var words = (List<int>) Words;
            words.Add(word);
        }


    }
}
