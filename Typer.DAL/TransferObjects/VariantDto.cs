using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.DAL.TransferObjects
{
    public class VariantDto
    {

        public int Id { get; set; }
        public int VariantSetId { get; set; }
        public string Key { get; set; }
        public string Content { get; set; }
        public int? WordId { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Negative { set; get; }
        public int Positive { get; set; }

    }
}
