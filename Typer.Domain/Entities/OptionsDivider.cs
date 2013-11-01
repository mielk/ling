using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.Domain.Entities
{
    public class OptionsDivider
    {

        private string text;
        private List<string> list;

        public static OptionsDivider instance(string text)
        {
            return new OptionsDivider();
        }


        public List<string> getVariants()
        {

            list = new List<string>();

            if (!hasVariants(text))
            {
                list.Add(text);
                
            }
            else
            {
                list = breakToVariants(text);
            }

            return list;


            //List<string> list = new List<string>();
            //list.Add(Content);
            //int counter;

            //do{
            //    counter = list.Count;
            //    list = breakVariant(list);
            //} while (list.Count > counter);

            //return list;

        }



        private List<string> breakVariant(List<string> texts)
        {
            List<string> list = new List<string>();
            //int optionStart = findFirstOption(text);
            //if (optionStart < 0)
            //{
            //    list.Add(text);
            //}
            //else
            //{
            //    int optionEnd = findOptionClosing(text, optionStart);
            //}

            return list;

        }



        private int findFirstOption(string text)
        {
            return text.IndexOf('(');
        }

        private int findOptionClosing(string text, int start)
        {
            int level = 0;
            char[] chars = text.Substring(start).ToCharArray();

            foreach (char c in text.ToCharArray())
            {
                if (c == 40)
                {
                    level++;
                }
                else if (c == 41)
                {
                    level--;

                }
            }

            return 0;

        }


        private List<string> breakToVariants(string text)
        {
            List<string> list = new List<string>();
            Dictionary<int, List<string>> options = new Dictionary<int, List<string>>();
            //List<string> options = new List<string>();
            StringBuilder replaced = new StringBuilder();
            StringBuilder part = new StringBuilder();
            int level = 0;
            int counter = 0;


            if (!hasVariants(text))
            {
                list.Add(text);
                list.Add("");
                return list;
            }


            foreach (char c in text.ToCharArray())
            {
                if (c == 40)
                {
                    level++;
                    if (level == 1)
                        replaced.Append('{').Append(++counter).Append('}');
                }
                else if (c == 41)
                {
                    level--;
                    if (level == 0)
                        options.Add(counter, breakToVariants(part.ToString()));
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

            list.Add(replaced.ToString());

            for (int i = 1; i <= options.Count; i++)
            {
                list = crossVariants(list, options[i], "{" + i + "}");
            }


            return list;


        }






        private List<string> crossVariants(List<string> texts, List<string> options, string tag)
        {
            List<string> list = new List<string>();
            foreach (string text in texts)
            {
                foreach (string option in options)
                {
                    var str = text.Replace(tag, option);
                    list.Add(str);
                }
            }

            return list;

        }




        private bool hasVariants(string text)
        {
            int bracket = text.IndexOf('(');
            return (bracket > 0);
        }




    }
}