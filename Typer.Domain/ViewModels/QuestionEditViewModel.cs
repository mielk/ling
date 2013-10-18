using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Entities;

namespace Typer.Domain.ViewModels
{
    public class QuestionEditViewModel
    {

        public Question Question { get; set; }

        public User User { get; set; }



        public IEnumerable<Language> getUserLanguages()
        {
            return null;
        }



        public bool isValid()
        {
            if (Question != null && User != null)
                return true;

            return false;

        }


    }
}
