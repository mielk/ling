using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.Domain.Entities
{
    public class QuestionOption
    {

        public int Id { get; set; }
        public int QuestionId { get; set; }
        public int LanguageId { get; set; }
        public string Content { get; set; }
        public int Weight { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Positive { get; set; }
        public int Negative { get; set; }
        public bool IsComplex { get; set; }



        public List<string> getAllVariants()
        {
            if (hasVariants(Content))
            {
                return breakToVariants(Content);
            }
            else
            {
                List<string> variants = new List<string>();
                variants.Add(Content);
                return variants;
            }
        }



        private List<string> breakToVariants(string text)
        {
            List<string> list = new List<string>();
            List<string> options = new List<string>();
            char[] chars = text.ToCharArray();
            StringBuilder replaced = new StringBuilder();
            StringBuilder part = new StringBuilder();
            int level = 0;

            foreach (char c in chars)
            {
                if (c == 40)
                {
                    level++;
                    replaced.Append('*');
                }
                else if (c == 41)
                {
                    level--;
                    options.Add(part.ToString());
                    part.Clear();
                }
                else
                {
                    if (level == 0)
                    {
                        replaced.Append(c);
                    }
                    else if (level > 0)
                    {
                        part.Append(c);
                    }

                }                
            }


            //Dividing option strings.
            


            return list;

        }




        private bool hasVariants(string text)
        {
            int bracket = text.IndexOf('(');
            return (bracket > 0);
        }










            //StringBuilder sb = new StringBuilder();
            //List<StringBuilder> sbs = new List<StringBuilder>();
            //List<string> list = new List<string>();
            //int level = 0;
            //char[] chars = Content.ToCharArray();
            //StringBuilder part = new StringBuilder();

            //foreach (char c in chars)
            //{

            //}

            //sbs.Add(sb);


            //foreach (StringBuilder builder in sbs)
            //{
            //    list.Add(builder.ToString());
            //}


            //return list;





    }
}
