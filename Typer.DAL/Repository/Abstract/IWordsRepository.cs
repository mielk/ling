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

        bool UpdateName(int id, string name);
        bool UpdateWeight(int id, int weight);
        bool UpdateProperties(int id, string name, int weight);
        bool UpdateCategories(int id, IEnumerable<int> categories);
        bool UpdateMetaword(MetawordDto metaword, int currentUserId);
        bool UpdateWord(WordDto word);


        bool Activate(int id);
        bool Deactivate(int id);
        bool NameExists(string name);
        bool NameExists(int id, string name);

        IEnumerable<WordDto> GetWords(int metawordId);
        IEnumerable<WordDto> GetWords(int metawordId, IEnumerable<int> languages);
        IEnumerable<WordDto> GetWords(int languageId, int wordtype, string word);
        IEnumerable<WordCategoryDto> GetCategories(int metawordId);
        IEnumerable<int> GetMetawordsIdsByCategories(int[] categories);
        IEnumerable<GrammarFormDto> GetGrammarForms(int wordId);
        IEnumerable<GrammarFormDto> GetGrammarForms(int definition, int[] wordsIds);
        IEnumerable<WordPropertyDto> GetPropertyValues(int wordId);

        WordDto GetWord(int id);
    }
}