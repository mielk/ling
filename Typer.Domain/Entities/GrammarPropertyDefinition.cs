using System.Collections.Generic;
using Typer.Domain.Services;

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

        //public void LoadOptions()
        //{
        //    var service = WordServicesFactory.Instance().GetService();
        //    Options = service.GetGrammarPropertyOptions(Id);
        //}

    }
}