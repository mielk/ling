using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.BLL.Services
{
    public class LanguageServicesFactory
    {

        private static LanguageServicesFactory _instance;

        private readonly ILanguageService service;



        private LanguageServicesFactory()
        {
            service = new LanguageService(null);
        }


        public static LanguageServicesFactory Instance()
        {
            if (_instance == null)
            {
                _instance = new LanguageServicesFactory();
            }

            return _instance;

        }


        public ILanguageService getService()
        {
            return service;
        }


    }
}