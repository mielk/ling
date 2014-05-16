using System.Collections.Generic;
using Typer.DAL.TransferObjects;

// ReSharper disable once CheckNamespace
namespace Typer.DAL.Repositories
{
    public interface ILanguageRepository
    {
        IEnumerable<LanguageDto> GetLanguages();
        LanguageDto GetLanguage(int id);
        IEnumerable<int> GetUserLanguages(int userId);
    }
}