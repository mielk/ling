using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Typer.Domain.Services
{
    public class WordServicesFactory
    {

        private static WordServicesFactory _instance;

        private readonly IWordService service;



        private WordServicesFactory()
        {
            service = new WordService(null);
        }


        public static WordServicesFactory Instance()
        {
            if (_instance == null)
            {
                _instance = new WordServicesFactory();
            }

            return _instance;

        }


        public IWordService getService()
        {
            return service;
        }


    }
}