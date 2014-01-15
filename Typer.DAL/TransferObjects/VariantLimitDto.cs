using System;

namespace Typer.DAL.TransferObjects
{
    public class VariantLimitDto
    {

        public int Id { get; set; }
        public int QuestionId { get; set; }
        public int VariantId { get; set; }
        public int ConnectedVariantId { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }

    }
}
