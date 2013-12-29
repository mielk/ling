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
        bool Update(int id, string name, int wordtype, int weight, int[] categories, int[] removed, string[] edited, string[] added);
        bool AddMetaword(Metaword metaword);
        int AddMetaword(string name, int wordtype, int weight, int[] categories, string[] options);
        IEnumerable<Word> GetWords(int metawordId);
        IEnumerable<Word> GetWords(int metawordId, int[] languages);
        IEnumerable<Category> GetCategories(int metawordId);
        IEnumerable<Metaword> Filter(int wordType, int lowWeight, int upWeight, int[] categories, string text);
        IEnumerable<WordtypeProperty> GetProperties(int languageId, int wordtypeId);
    }
}
