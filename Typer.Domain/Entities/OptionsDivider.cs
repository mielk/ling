using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Typer.Domain.Entities
{
    public class OptionsDivider
    {

        private string text;


        public OptionsDivider(string text)
        {
            this.text = text;
        }


        public List<string> getVariants()
        {

            var root = new Part(text);
            return root.getVariants();

            //List<string> list = new List<string>();
            //if (!hasVariants(text))
            //{
            //    list.Add(text);

            //}
            //else
            //{
            //    list = breakToVariants(text);
            //}

            //return list;

        }



        //private List<string> breakToVariants(string text)
        //{
        //    List<string> list = new List<string>();
        //    Dictionary<int, List<string>> options = new Dictionary<int, List<string>>();
        //    StringBuilder replaced = new StringBuilder();

        //    if (!hasVariants(text))
        //        return extractVariants(text);


        //    produceVariantsList(text, replaced, options);
        //    list.Add(replaced.ToString());

        //    for (int i = 1; i <= options.Count; i++)
        //    {
        //        list = crossVariants(list, options[i], "{" + i + "}");
        //    }


        //    return list;


        //}



        //private List<string> extractVariants(string text)
        //{
        //    List<string> list = text.Split('/').ToList();
        //    if (list.Count == 1)
        //        list.Add("");

        //    return list;

        //}










        //List<string> processed = new List<string>();
        //foreach (string s in raw)
        //{
        //    processed.AddRange(breakToVariants(s));
        //}



        //private List<string> crossVariants(List<string> texts, List<string> options, string tag)
        //{
        //    List<string> list = new List<string>();
        //    foreach (string text in texts)
        //    {
        //        foreach (string option in options)
        //        {
        //            var str = text.Replace(tag, option);
        //            list.Add(str);
        //        }
        //    }

        //    return list;

        //}




        //private bool hasVariants(string text)
        //{
        //    int bracket = text.IndexOf('(');
        //    return (bracket > 0);
        //}




    }



    class Part
    {
        public string Name { get; set; }
        public Part Parent { get; set; }
        public string Content { get; set; }
        public List<Part> Children { get; set; }
        private StringBuilder replaced = new StringBuilder();
        private List<string> variants = new List<string>();

        public Part(string content, Part parent, int index)
        {
            Parent = parent;
            Content = content;
            Name = "{" + index + "}";
            Children = new List<Part>();
        }

        public Part(string content)
        {
            Parent = null;
            Content = content;
            Children = new List<Part>();
            Name = "{0}";
        }

        public bool isRoot()
        {
            return (Parent == null);
        }

        public List<string> getVariants()
        {
            extractParts();
            createVariants();
            return merge();
        }



        private void extractParts()
        {
            var chars = Content.ToCharArray();
            var variant = new StringBuilder();
            var level = 0;
            var counter = 0;

            foreach (var c in chars)
            {
                if (c == 40)
                {
                    level++;
                    if (level == 1)
                    {
                        replaced.Append('{').Append(++counter).Append('}');
                    }
                    else
                    {
                        variant.Append(c);
                    }
                }
                else if (c == 41)
                {
                    level--;
                    if (level == 0)
                    {
                        var part = new Part(variant.ToString(), this, counter);
                        Children.Add(part);
                        variant.Clear();
                    }
                    else
                    {
                        variant.Append(c);
                    }

                }
                else
                {
                    if (level == 0)
                    {
                        replaced.Append(c);
                    }
                    else if (level > 0)
                    {
                        variant.Append(c);
                    }

                }

            }

        }

        private void createVariants()
        {
            variants = replaced.ToString().Split('/').ToList();
            if (!isRoot() && variants.Count == 1)
            {
                variants.Add("");
            }
        }

        private List<string> merge()
        {
            var list = variants;

            foreach (var part in Children)
            {
                list = crossVariants(list, part.getVariants(), part.Name);
            }

            return list;
        }



        private List<string> crossVariants(List<string> texts, List<string> options, string tag)
        {
            var list = new List<string>();
            foreach (var text in texts)
            {
                foreach (var option in options)
                {
                    var str = text.Replace(tag, option);
                    if (!list.Contains(str))
                    {
                        list.Add(str);
                    }
                }
            }

            return list;

        }


    }


}