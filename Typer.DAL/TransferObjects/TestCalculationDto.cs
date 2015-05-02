using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.DAL.TransferObjects
{
    public class TestCalculationDto
    {
        public int Id { get; set; }
        public int QuestionId { get; set; }
        public double TimeFactor { get; set; }
        public double DoneFactor { get; set; }
        public double CorrectFactor { get; set; }
        public bool Inherited { get; set; }
        public bool IsNew { get; set; }
        public int Total { get; set; }
    }
}
