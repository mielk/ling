using System;

namespace Typer.DAL.TransferObjects
{
    public class VariantDto
    {

        public int Id { get; set; }
        public int VariantSetId { get; set; }
        public string Key { get; set; }
        public string Content { get; set; }
        public bool IsAnchored { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Negative { set; get; }
        public int Positive { get; set; }

    }
}
