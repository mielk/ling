using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.DAL.TransferObjects
{
    public class GrammarFormInactiveRuleDto
    {
        public int Id { get; set; }
        public int DefinitionId { get; set; }
        public int PropertyId { get; set; }
        public int ValueId { get; set; }
    }
}
