using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Entities;

namespace Typer.Domain.Services
{
    public interface IWordService
    {
        IEnumerable<Metaword> getMetawords();
        Metaword getMetaword(int id);
        bool changeWeight(int id, int weight);
        bool activate(int id);
        bool deactivate(int id);
        bool nameExists(string name);
        bool nameExists(int id, string name);
        bool updateMetaword(Metaword metaword);
        bool addMetaword(Metaword metaword);
        IEnumerable<Word> getWords(int metawordId);
    }
}
