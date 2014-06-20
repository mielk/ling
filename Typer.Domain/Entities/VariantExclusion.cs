using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.Domain.Entities
{
    public class VariantExclusion
    {
        public int Id { get; set; }
        public int VariantSetId { get; set; }
        public string Key { get; set; }
    }
}
