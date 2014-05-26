using System.Collections.Generic;

namespace Typer.Domain.Entities
{
    public class GrammarFormGroup
    {
        public int Id { get; set; }
        public int LanguageId { get; set; }
        public int WordtypeId { get; set; }
        public string Name { get; set; }
        public bool IsHeader { get; set; }
        public int Index { get; set; }
        public IEnumerable<GrammarFormDefinition> Forms;



        public GrammarFormGroup()
        {
            Forms = new List<GrammarFormDefinition>();
        }

        public void AddForm(GrammarFormDefinition form)
        {
            var list = (List<GrammarFormDefinition>)Forms;
            list.Add(form);
        }

    }
}
