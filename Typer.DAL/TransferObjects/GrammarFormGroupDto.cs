using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.DAL.TransferObjects
{
    public class GrammarFormGroupDto
    {
        public int Id { get; set; }
        public int LanguageId { get; set; }
        public int WordtypeId { get; set; }
        public string Name { get; set; }
        public bool IsHeader { get; set; }
        public int Index { get; set; }
    }
}
