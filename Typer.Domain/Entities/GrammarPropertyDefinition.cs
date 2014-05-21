using System.Collections.Generic;

namespace Typer.Domain.Entities
{
    public class GrammarPropertyDefinition
    {
        public int Id { get; set; }
        public int LanguageId { get; set; }
        public string Name { get; set; }
        public int Type { get; set; }
        public bool Default { get; set; }
        public IEnumerable<GrammarPropertyOption> Options { get; set; }

        public GrammarPropertyDefinition()
        {
            Options = new List<GrammarPropertyOption>();
        }

        public void AddOption(GrammarPropertyOption option)
        {
            var list = (List<GrammarPropertyOption>) Options;
            list.Add(option);
        }

    }
}