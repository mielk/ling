using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.Domain.Entities
{
    public class GrammarFormInactiveRule
    {
        public int Id { get; set; }
        public int DefinitionId { get; set; }
        public int PropertyId { get; set; }
        public int ValueId { get; set; }
    }
}
