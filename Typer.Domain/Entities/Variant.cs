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
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Negative { set; get; }
        public int Positive { get; set; }
        //public List<Variant> Excluded { get; set; }
        public List<int> Excluded { get; set; }

        public Variant()
        {
            Excluded = new List<int>();
        }

        public void AddExcluded(Variant variant)
        {
            Excluded.Add(variant.Id);
        }


    }
}
