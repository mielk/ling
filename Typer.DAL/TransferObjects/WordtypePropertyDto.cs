using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.DAL.TransferObjects
{

    public class WordtypePropertyDto
    {
        public int Id { get; set; }
        public int LanguageId { get; set; }
        public int WordtypeId { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Details { get; set; }
    }
}