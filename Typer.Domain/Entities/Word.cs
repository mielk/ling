using System;
using System.Collections.Generic;

namespace Typer.Domain.Entities
{
    public class Word
    {

        public int Id { get; set; }
        public int MetawordId { get; set; }
        public int LanguageId { get; set; }
        public string Name { get; set; }
        public int Weight { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Positive { get; set; }
        public int Negative { get; set; }
        public IEnumerable<WordProperty> Properties { get; set; }
        public IEnumerable<GrammarForm> GrammarForms { get; set; }

    }
}
