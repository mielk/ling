using System.Collections.Generic;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Repositories
{
    public interface IWordsRepository
    {
        IEnumerable<MetawordDto> getMetawords();
        MetawordDto getMetaword(int id);
        MetawordDto getMetaword(string name);

        bool addMetaword(MetawordDto metaword);

        bool updateName(int id, string name);
        bool updateWeight(int id, int weight);
        bool updateProperties(int id, string name, int weight);
        bool updateCategories(int id, int[] categories);

        bool activate(int id);
        bool deactivate(int id);
        bool nameExists(string name);
        bool nameExists(int id, string name);

        IEnumerable<WordDto> getWords(int metawordId);
        IEnumerable<WordCategoryDto> getCategories(int metawordId);
        
    }
}