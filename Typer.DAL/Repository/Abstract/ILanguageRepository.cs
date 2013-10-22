using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Repositories
{
    public interface ILanguageRepository
    {
        IEnumerable<LanguageDto> getLanguages();
        LanguageDto getLanguage(int id);
        IEnumerable<LanguageDto> getUserLanguages(int userId);
    }
}