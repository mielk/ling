using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.Domain.Services
{
    public interface ILanguageService
    {
        IEnumerable<Language> getLanguages();
        Language getLanguage(int id);
        IEnumerable<Language> getUserLanguages(int userId);
    }
}
