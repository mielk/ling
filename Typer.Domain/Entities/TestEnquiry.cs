using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.Domain.Entities
{
    public class TestEnquiry
    {

        private Question question;
        private Language parentLanguage;
        private Language learnLanguage;



        public TestEnquiry(Question question, Language parent, Language learn)
        {
            this.question = question;
            this.parentLanguage = parent;
            this.learnLanguage = learn;
        }



    }
}
