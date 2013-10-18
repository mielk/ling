using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Entities;

namespace Typer.DAL.TransferObjects
{
    public class LanguageDto
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public Language toLanguage()
        {

            Language language = new Language()
            {
                Id = this.Id,
                Name = this.Name
            };

            return language;

        }

    }

}