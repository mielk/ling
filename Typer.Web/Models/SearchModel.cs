using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.Web.Models
{
    public class SearchModel
    {
        public int WordType { get; set; }
        public int LWeight { get; set; }
        public int UWeight { get; set; }
        public string Contain { get; set; }
        public IEnumerable<Category> Categories { get; set; }
    }
}