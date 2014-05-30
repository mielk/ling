using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace Typer.Domain.Entities
{
    public class WordProperty
    {
        public int Id { get; set; }
        public int WordId { get; set; }
        public int PropertyId { get; set; }
        public int ValueId { get; set; }


        public WordProperty()
        {
            
        }

        public WordProperty(JToken token)
        {
            WordId = (int) token.SelectToken("WordId");
            PropertyId = (int) token.SelectToken("PropertyId");
            ValueId = (int) token.SelectToken("ValueId");
        }

        public static IEnumerable<WordProperty> GetCollection(JToken token)
        {
            return token.Children().Select(item => new WordProperty(item)).ToList();
        }

    }
}