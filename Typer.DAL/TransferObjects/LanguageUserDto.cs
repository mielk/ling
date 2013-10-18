using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.DAL.TransferObjects
{
    public class LanguageUserDto
    {
        public int Id { get; set; }
        public int LanguageId { get; set; }
        public int UserId { get; set; }
    }
}
