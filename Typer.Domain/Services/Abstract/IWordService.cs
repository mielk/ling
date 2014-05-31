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
        bool UpdateCategories(int id, int[] categories);
        int UpdateMetaword(Metaword metaword);
        int AddMetaword(Metaword metaword);
        IEnumerable<Word> GetWords(int metawordId);
        IEnumerable<Word> GetWords(int metawordId, int[] languages);
        IEnumerable<Category> GetCategories(int metawordId);
        IEnumerable<Metaword> Filter(int wordType, int lowWeight, int upWeight, int[] categories, string text);
        //Return properties of the given word, i.e. word Polska is of femininum etc.
        IEnumerable<WordProperty> GetPropertyValues(int wordId);
        IEnumerable<GrammarForm> GetGrammarForms(int wordId);
        IEnumerable<GrammarForm> GetGrammarForms(int definition, int[] wordsIds);
        IEnumerable<Word> GetWords(int languageId, int wordtype, string word);
        Word GetWord(int id);
    }
}
