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
        bool AddMetaword(Metaword metaword);
        IEnumerable<Word> GetWords(int metawordId);
        IEnumerable<Category> GetCategories(int metawordId);
    }
}
