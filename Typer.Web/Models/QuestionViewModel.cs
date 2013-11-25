using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Entities;
using Typer.Domain.Services;

namespace Typer.Web.Models
{
    public class QuestionViewModel
    {

        public int Id { get; set; }
        public string Name { get; set; }
        public int Weight { get; set; }
        public int CreatorId { get; set; }
        public string CreatorName { get; set; }
        public DateTime CreateDate { get; set; }

    }
}
