using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.DAL.TransferObjects
{
    public class MatchVariantWordDto
    {
        public int Id { get; set; }
        public int VariantId { get; set; }
        public int WordId { get; set; }
    }
}
