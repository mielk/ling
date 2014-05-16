using System.Collections.Generic;
using Typer.Domain.Entities;

// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public interface ILanguageService
    {
        IEnumerable<Language> GetLanguages();
        Language GetLanguage(int id);
        IEnumerable<int> GetUserLanguages(int userId);
    }
}
