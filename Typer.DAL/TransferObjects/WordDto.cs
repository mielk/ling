using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Typer.DAL.TransferObjects
{
    public class WordDto
    {
        [Key]
        public int Id { get; set; }
        public int MetawordId { get; set; }
        public int LanguageId { get; set; }
        public string Name { get; set; }
        public int Weight { get; set; }
        public bool IsActive { get; set; }
        public bool IsCompleted { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Positive { get; set; }
        public int Negative { get; set; }
        [NotMapped]
        public bool Edited { get; set; }
        [NotMapped]
        public GrammarFormDto[] GrammarForms { get; set; }
        [NotMapped]
        public WordPropertyDto[] Properties { get; set; }

    }
}