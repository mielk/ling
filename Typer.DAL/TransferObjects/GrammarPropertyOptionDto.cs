using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.DAL.TransferObjects
{
    public class GrammarPropertyOptionDto
    {
        public int Id { get; set; }
        public int PropertyId { get; set; }
        public string Name { get; set; }
        public int Value { get; set; }
        public bool Default { get; set; }
    }
}
