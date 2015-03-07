using System;
using System.ComponentModel.DataAnnotations;

namespace Typer.DAL.TransferObjects
{
    public class QuestionOptionDto
    {

		[Key]
        public int Id { get; set; }
        public int QuestionId { get; set; }
        public int LanguageId { get; set; }
        public string Content { get; set; }
        public int Weight { get; set; }
        public bool IsMain { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Positive { get; set; }
        public int Negative { get; set; }
        public bool IsComplex { get; set; }
        public bool IsCompleted { get; set; }
    }
}
