﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Typer.Domain.Entities;

namespace Typer.Web.Models
{
    public class TestQuestionViewModel
    {
        public Question Question { get; set; }
        public Language ParentLanguage { get; set; }
        public Language LearnLanguage { get; set; }
        private QuestionOption selectedOption;


    }
}