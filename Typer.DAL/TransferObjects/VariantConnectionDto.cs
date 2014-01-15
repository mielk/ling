using System;

namespace Typer.DAL.TransferObjects
{
    public class VariantConnectionDto
    {
        public int Id { get; set; }
        public int VariantSetId { get; set; }
        public int ConnectedSetId { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
    }
}
