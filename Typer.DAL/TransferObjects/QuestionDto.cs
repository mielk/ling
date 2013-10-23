using System;
using System.ComponentModel.DataAnnotations;

namespace Typer.DAL.TransferObjects
{
    public class QuestionDto
    {
        [Key()]
        public int Id { get; set; }
        public string Name { get; set; }
        public int Weight { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Positive { get; set; }
        public int Negative { get; set; }
        public bool IsComplex { get; set; }
    }
}
