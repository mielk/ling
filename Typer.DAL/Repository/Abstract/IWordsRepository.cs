using System.Collections.Generic;
using Typer.DAL.TransferObjects;

// ReSharper disable once CheckNamespace
namespace Typer.DAL.Repositories
{
    public interface IWordsRepository
    {
        IEnumerable<MetawordDto> GetMetawords();
        MetawordDto GetMetaword(int id);
        MetawordDto GetMetaword(string name);

        bool AddMetaword(MetawordDto metaword);
        int AddMetaword(string name, int wordtype, int weight, int[] categories, string[] options, string[] properties, string[] forms);

        bool UpdateName(int id, string name);
        bool UpdateWeight(int id, int weight);
        bool UpdateProperties(int id, string name, int weight);
        bool UpdateCategories(int id, int[] categories);
        bool Update(int id, string name, int wordtype, int weight, int[] categories, int[] removed,
            string[] edited, string[] added, string[] properties, string[] forms);

        bool Activate(int id);
        bool Deactivate(int id);
        bool NameExists(string name);
        bool NameExists(int id, string name);

        IEnumerable<WordDto> GetWords(int metawordId);
        IEnumerable<WordDto> GetWords(int metawordId, int[] languages);
        IEnumerable<WordDto> GetWords(int languageId, int wordtype, string word);
        IEnumerable<WordCategoryDto> GetCategories(int metawordId);
        IEnumerable<int> GetMetawordsIdsByCategories(int[] categories);
        IEnumerable<WordtypePropertyValueDto> GetPropertyValues(int wordId);
        IEnumerable<GrammarFormDto> GetGrammarForms(int wordId);
        IEnumerable<GrammarFormDto> GetGrammarForms(int definition, int[] wordsIds);
    }
}