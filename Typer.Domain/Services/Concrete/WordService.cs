using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Infrastructure;
using Typer.DAL.Repositories;
using Typer.Domain.Entities;
using Typer.Common.Helpers;
using Typer.DAL.TransferObjects;

namespace Typer.Domain.Services
{
    public class WordService : IWordService
    {


        private readonly IWordsRepository repository;

        public WordService(IWordsRepository repository)
        {
            if (repository == null)
            {
                this.repository = RepositoryFactory.getWordsRepository();
            }
            else
            {
                this.repository = repository;
            }
        }



        public IEnumerable<Metaword> getMetawords()
        {
            IEnumerable<MetawordDto> dataObjects = repository.getMetawords();
            List<Metaword> metawords = new List<Metaword>();

            foreach (MetawordDto dto in dataObjects)
            {
                metawords.Add(metawordFromDto(dto));
            }

            return metawords;

        }

        public Metaword getMetaword(int id)
        {
            MetawordDto dto = repository.getMetaword(id);
            return metawordFromDto(dto);
        }



        public bool changeWeight(int id, int weight)
        {
            return repository.updateWeight(id, weight.ToRange(Metaword.MinWeight, Metaword.MaxWeight));
        }


        public bool activate(int id)
        {
            return repository.activate(id);
        }


        public bool deactivate(int id)
        {
            return repository.deactivate(id);
        }

        public bool nameExists(string name)
        {
            return repository.nameExists(name);
        }

        public bool nameExists(int id, string name)
        {
            MetawordDto metaword = repository.getMetaword(name);

            if (metaword != null)
            {
                return (metaword.Id == id ? false : true);
            }
            else
            {
                return false;
            }

        }


        public bool updateMetaword(Metaword metaword)
        {
            return repository.updateProperties(metaword.Id, metaword.Name, metaword.Weight);
        }

        public bool addMetaword(Metaword metaword)
        {
            MetawordDto dto = metawordToDto(metaword);
            return repository.addMetaword(dto);
        }

        public IEnumerable<Word> getWords(int metawordId)
        {
            List<Word> words = new List<Word>();
            IEnumerable<WordDto> dataObjects = repository.getWords(metawordId);

            foreach (WordDto dto in dataObjects)
            {
                words.Add(wordFromDto(dto));
            }

            return words;

        }




        private Metaword metawordFromDto(MetawordDto dto)
        {
            return new Metaword()
            {
                CreateDate = dto.CreateDate,
                CreatorId = dto.CreatorId,
                Id = dto.Id,
                IsActive = dto.IsActive,
                IsApproved = dto.IsApproved,
                Name = dto.Name,
                Negative = dto.Negative,
                Positive = dto.Positive,
                Weight = dto.Weight,
                Type = (WordType) dto.Type
            };
        }

        private MetawordDto metawordToDto(Metaword metaword)
        {
            return new MetawordDto()
            {
                CreateDate = metaword.CreateDate,
                CreatorId = metaword.CreatorId,
                Id = metaword.Id,
                IsActive = metaword.IsActive,
                IsApproved = metaword.IsApproved,
                Name = metaword.Name,
                Negative = metaword.Negative,
                Positive = metaword.Positive,
                Weight = metaword.Weight,
                Type = (int) metaword.Type
            };
        }

        private Word wordFromDto(WordDto dto)
        {
            return new Word()
            {
                CreateDate = dto.CreateDate,
                CreatorId = dto.CreatorId,
                Id = dto.Id,
                IsActive = dto.IsActive,
                IsApproved = dto.IsApproved,
                LanguageId = dto.LanguageId,
                MetawordId = dto.MetawordId,
                Name = dto.Name,
                Negative = dto.Negative,
                Positive = dto.Positive,
                Weight = dto.Weight
            };
        }

        private WordDto wordToDto(Word word)
        {
            return new WordDto()
            {
                CreateDate = word.CreateDate,
                CreatorId = word.CreatorId,
                Id = word.Id,
                IsActive = word.IsActive,
                IsApproved = word.IsApproved,
                LanguageId = word.LanguageId,
                MetawordId = word.MetawordId,
                Name = word.Name,
                Negative = word.Negative,
                Positive = word.Positive,
                Weight = word.Weight
            };
        }


    }
}