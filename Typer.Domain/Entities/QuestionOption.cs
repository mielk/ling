using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;

namespace Typer.Domain.Entities
{
    public class QuestionOption
    {

        public int Id { get; set; }
        public int QuestionId { get; set; }
        public int LanguageId { get; set; }
        public string Content { get; set; }
        public int? WordId { get; set; }
        public int Weight { get; set; }
        public bool IsMain { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Positive { get; set; }
        public int Negative { get; set; }
        public bool IsComplex { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsEdited { get; set; }
        public bool IsNew { get; set; }

        public QuestionOption()
        {

        }


        public QuestionOption(JToken token)
        {

            Id = (int)token.SelectToken("Id");
            IsEdited = token.Value<bool?>("Edited") ?? false;
            IsNew = token.Value<bool?>("New") ?? false;

            QuestionId = (int)token.SelectToken("QueryId");
            LanguageId = (int)token.SelectToken("LanguageId");
            Content = (string)token.SelectToken("Content");
            Weight = (int)token.SelectToken("Weight");
            IsMain = (bool)token.SelectToken("IsMain");
            IsCompleted = (bool)token.SelectToken("IsCompleted");
            IsActive = (bool)token.SelectToken("IsActive");
            CreatorId = (int)token.SelectToken("CreatorId");
            CreateDate = (DateTime)token.SelectToken("CreateDate");
            IsApproved = (bool)token.SelectToken("IsApproved");
            Positive = (int)token.SelectToken("Positive");
            Negative = (int)token.SelectToken("Negative");

        }



        public static IEnumerable<QuestionOption> GetCollection(JToken token)
        {
            //var service = CategoryServicesFactory.Instance().GetService();

            var list = new List<QuestionOption>();

            foreach (var t in token.Children())
            {
                var option = new QuestionOption(t);
                list.Add(option);
            }

            return list;

        }


    }

}
