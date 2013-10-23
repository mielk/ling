using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Typer.Domain.Entities;

namespace Typer.Web.Models
{
    public class QuestionLanguageViewModel
    {
        public Question Question { get; set; }
        public Language Language { get; set; }



    }
}