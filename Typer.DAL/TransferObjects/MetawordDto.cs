using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Typer.DAL.TransferObjects
{
    public class MetawordDto
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public int Weight { get; set; }
        public int Type { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Positive { get; set; }
        public int Negative { get; set; }
        [NotMapped]
        public int[] Categories { get; set; }
        [NotMapped]
        public WordDto[] Words { get; set; }
    }

}
