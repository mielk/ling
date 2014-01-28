using System.Collections.Generic;
using Typer.Domain.Entities;

// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public interface IWordService
    {
        IEnumerable<Metaword> GetMetawords();
        Metaword GetMetaword(int id);
        bool ChangeWeight(int id, int weight);
        bool Activate(int id);
        bool Deactivate(int id);
        bool NameExists(string name);
        bool NameExists(int id, string name);
        bool UpdateMetaword(Metaword metaword);
        bool UpdateCategories(int id, int[] categories);
        bool Update(int id, string name, int wordtype, int weight, int[] categories, int[] removed, string[] edited, string[] added, string[] properties, string[] forms);
        bool AddMetaword(Metaword metaword);
        int AddMetaword(string name, int wordtype, int weight, int[] categories, string[] options, string[] properties, string[] forms);
        IEnumerable<Word> GetWords(int metawordId);
        IEnumerable<Word> GetWords(int metawordId, int[] languages);
        IEnumerable<Category> GetCategories(int metawordId);
        IEnumerable<Metaword> Filter(int wordType, int lowWeight, int upWeight, int[] categories, string text);
        IEnumerable<GrammarPropertyDefinition> GetProperties(int languageId, int wordtypeId);
        IEnumerable<GrammarFormDefinition> GetGrammarFormDefinitions(int languageId, int wordtypeId);
        //Return properties of the given word, i.e. word Polska is of femininum etc.
        IEnumerable<WordtypePropertyValue> GetPropertyValues(int wordId);
        IEnumerable<GrammarForm> GetGrammarForms(int wordId);
        IEnumerable<Word> GetWords(int languageId, int wordtype, string word);
    }
}
