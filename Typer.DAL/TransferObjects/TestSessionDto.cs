using System;
namespace Typer.DAL.TransferObjects
{
    public class TestSessionDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BaseLanguage { get; set; }
        public int LearnedLanguage { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int Queries { get; set; }
        public int Correct { get; set; }
        public int Wrong { get; set; }
        public int Questions { get; set; }
        public int BestRow { get; set; }
        public bool Completed { get; set; }
    }
}
