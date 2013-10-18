using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Entities;

namespace Typer.DAL.Repositories
{
    public interface ILanguageRepository
    {
        IEnumerable<Language> getLanguages();
        Language getLanguage(int id);
        IEnumerable<Language> getUserLanguages(int userId);
    }
}