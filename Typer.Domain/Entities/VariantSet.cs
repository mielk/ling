﻿using System;
using System.Collections.Generic;
using Typer.Domain.Services;

namespace Typer.Domain.Entities
{
    public class VariantSet
    {

        public int Id { get; set; }
        public int QuestionId { get; set; }
        public int LanguageId { get; set; }
        public string VariantTag { get; set; }
        public string Params { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public List<Variant> Variants { get; set; }
        public List<VariantSet> Related { get; set; }
        public List<VariantSet> Dependants { get; set; }
        public VariantSet Parent { get; set; }


        public void AddVariant(Variant variant)
        {
            Variants.Add(variant);
        }

        public void AddRelated(VariantSet set)
        {
            Related.Add(set);
        }

        public void AddDependant(VariantSet set)
        {
            Dependants.Add(set);
        }


        public void LoadVariants()
        {
            Variants = QuestionServicesFactory.Instance().GetService().GetVariants(Id);
        }


    }
}