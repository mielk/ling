using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.DAL.TransferObjects
{
    public class VariantConstraintDto
    {

        public int Id { get; set; }
        public int VariantId { get; set; }
        public int ConnectedVariantId { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }

    }
}
