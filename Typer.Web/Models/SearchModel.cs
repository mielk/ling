using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Typer.Web.Models
{
    public class SearchModel
    {
        public int WordType { get; set; }
        public int LWeight { get; set; }
        public int UWweight { get; set; }
        public string Container { get; set; }
    }
}