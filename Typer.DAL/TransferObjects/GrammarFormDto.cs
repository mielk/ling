using System;

namespace Typer.DAL.TransferObjects
{

    public class GrammarFormDto
    {
        public int Id { get; set; }
        public int WordId { get; set; }
        public string Definition { get; set; }
        public string Content { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Positive { get; set; }
        public int Negative { get; set; }
    }

}
