using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using Typer.Domain.Services;

namespace Typer.Domain.Entities
{
    public class Word
    {

        public int Id { get; set; }
        public int MetawordId { get; set; }
        public int LanguageId { get; set; }
        public string Name { get; set; }
        public int Weight { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Positive { get; set; }
        public int Negative { get; set; }
        public bool Edited { get; set; }
        public IEnumerable<WordProperty> Properties { get; set; }
        public IEnumerable<GrammarForm> GrammarForms { get; set; }

        public Word()
        {
            
        }

        public Word(JToken token)
        {
            Id = (int) token.SelectToken("Id");
            MetawordId = (int) token.SelectToken("MetawordId");
            LanguageId = (int) token.SelectToken("LanguageId");
            Name = (string) token.SelectToken("Name");
            Weight = (int) token.SelectToken("Weight");
            IsCompleted = (bool) token.SelectToken("IsCompleted");
            IsActive = (bool) token.SelectToken("IsActive");
            Edited = (bool)token.SelectToken("Edited");
            CreatorId = (int) token.SelectToken("CreatorId");
            CreateDate = (DateTime) token.SelectToken("CreateDate");
            Properties = WordProperty.GetCollection(token.SelectToken("Properties"));
            GrammarForms = GrammarForm.GetCollection(token.SelectToken("GrammarForms"));
        }

        public static IEnumerable<Word> GetCollection(JToken token)
        {
            var service = WordServicesFactory.Instance().GetService();
            var words = new List<Word>();

            foreach (var item in token.Children())
            {
                var edited = (bool)item.SelectToken("Edited");
                var word = edited ? new Word(item) : service.GetWord((int) item.SelectToken("Id"));
                words.Add(word);
            }

            return words;

        }


    }
}
