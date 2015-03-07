using System;
using System.ComponentModel.DataAnnotations;

namespace Typer.DAL.TransferObjects
{
    public class UserQueryDto
    {

        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public int QuestionId { get; set; }
        public int BaseLanguage { get; set; }
        public int LearnedLanguage { get; set; }
        public string Last50 { get; set; }
        public int Counter { get; set; }
        public int CorrectAnswers { get; set; }
        public DateTime? LastQuery  { get; set; }
        public int ToDo  { get; set; }

    }
}