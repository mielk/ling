using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace Typer.Domain.Entities
{
    public class GrammarForm
    {
        public int Id { get; set; }
        public int WordId { get; set; }
        public int FormId { get; set; }
        public string Content { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Positive { get; set; }
        public int Negative { get; set; }


        public GrammarForm()
        {
            
        }

        public GrammarForm(JToken token)
        {
            WordId = (int) token.SelectToken("WordId");
            FormId = (int) token.SelectToken("FormId");
            Content = (string) token.SelectToken("Content");
            IsActive = true;
        }

        public static IEnumerable<GrammarForm> GetCollection(JToken token)
        {
            return token.Children().Select(item => new GrammarForm(item)).ToList();
        }

    }
}
