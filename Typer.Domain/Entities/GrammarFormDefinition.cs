using System.Collections.Generic;
namespace Typer.Domain.Entities
{
    public class GrammarFormDefinition
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public string Displayed { get; set; }
        public int Index { get; set; }
        public IEnumerable<GrammarFormDefinitionProperty> Properties { get; set; }
        public IEnumerable<GrammarFormInactiveRule> InactiveRules { get; set; }

        public GrammarFormDefinition()
        {
            Properties = new List<GrammarFormDefinitionProperty>();
            InactiveRules = new List<GrammarFormInactiveRule>();
        }


        public void AddProperty(GrammarFormDefinitionProperty property)
        {
            var list = (List<GrammarFormDefinitionProperty>)Properties;
            list.Add(property);
        }


        public void AddInactiveRule(GrammarFormInactiveRule rule)
        {
            var list = (List<GrammarFormInactiveRule>)InactiveRules;
            list.Add(rule);
        }


    }
}