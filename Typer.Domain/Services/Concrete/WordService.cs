using System.Collections.Generic;
using System.Linq;
using Typer.DAL.Infrastructure;
using Typer.DAL.Repositories;
using Typer.Domain.Entities;
using Typer.Common.Helpers;
using Typer.DAL.TransferObjects;

// ReSharper disable once CheckNamespace
namespace Typer.Domain.Services
{
    public class WordService : IWordService
    {

        private readonly IWordsRepository _repository;
        private readonly ICategoryService _categoryService = CategoryServicesFactory.Instance().GetService();

        public WordService(IWordsRepository repository)
        {
            _repository = repository ?? RepositoryFactory.GetWordsRepository();
        }


        public IEnumerable<Metaword> GetMetawords()
        {
            var dataObjects = _repository.GetMetawords();
            return dataObjects.Select(MetawordFromDto).ToList();
        }

        public Metaword GetMetaword(int id)
        {
            var dto = _repository.GetMetaword(id);
            return MetawordFromDto(dto);
        }



        public bool ChangeWeight(int id, int weight)
        {
            return _repository.UpdateWeight(id, weight.ToRange(Metaword.MinWeight, Metaword.MaxWeight));
        }


        public bool Activate(int id)
        {
            return _repository.Activate(id);
        }


        public bool Deactivate(int id)
        {
            return _repository.Deactivate(id);
        }

        public bool NameExists(string name)
        {
            return _repository.NameExists(name);
        }

        public bool NameExists(int id, string name)
        {
            var metaword = _repository.GetMetaword(name);

            if (metaword != null)
            {
                return (metaword.Id != id);
            }
            return false;
        }


        public bool UpdateMetaword(Metaword metaword)
        {
            var currentUserId = User.CurrentUserId;
            return metaword.Id == 0 ? AddMetaword(metaword) : _repository.UpdateMetaword(MetawordToDto(metaword), currentUserId);
        }

        public bool AddMetaword(Metaword metaword)
        {
            var dto = MetawordToDto(metaword);
            return _repository.AddMetaword(dto);
        }

        public int AddMetaword(string name, int wordtype, int weight, int[] categories, string[] options, string[] properties, string[] forms)
        {
            return 0;
            //return _repository.AddMetaword(name, wordtype, weight, categories, options, properties, forms);
        }

        public IEnumerable<Word> GetWords(int metawordId)
        {
            var dataObjects = _repository.GetWords(metawordId);
            return dataObjects.Select(WordFromDto).ToList();
        }

        public IEnumerable<Word> GetWords(int metawordId, int[] languages){
            var dataObjects = _repository.GetWords(metawordId, languages);
            return dataObjects.Select(WordFromDto).ToList();
        }

        public bool UpdateCategories(int id, int[] categoriesId)
        {
            return _repository.UpdateCategories(id, categoriesId);
        }

        public IEnumerable<Category> GetCategories(int metawordId)
        {
            var dtos = _repository.GetCategories(metawordId);
            return dtos.Select(dto => _categoryService.GetCategory(dto.CategoryId)).ToList();
        }

        public IEnumerable<WordProperty> GetPropertyValues(int wordId)
        {
            var dtos = _repository.GetPropertyValues(wordId);
            return dtos.Select(WordPropertyValueFromDto).ToList();
        }

        public IEnumerable<GrammarForm> GetGrammarForms(int wordId)
        {
            var dtos = _repository.GetGrammarForms(wordId);
            return dtos.Select(GrammarFormFromDto).ToList();
        }

        public IEnumerable<GrammarForm> GetGrammarForms(int definition, int[] wordsIds)
        {
            var dtos = _repository.GetGrammarForms(definition, wordsIds);
            return dtos.Select(GrammarFormFromDto).ToList();            
        }

        public IEnumerable<Metaword> Filter(int wordType, int lowWeight, int upWeight, int[] categories, string text)
        {
            var dtos = _repository.GetMetawords();

            if (wordType > 0) dtos = dtos.Where(w => w.Type == wordType);
            if (lowWeight > 0) dtos = dtos.Where(w => w.Weight >= lowWeight);
            if (upWeight > 0) dtos = dtos.Where(w => w.Weight <= upWeight);
            if (text.Length > 0) dtos = dtos.Where(w => w.Name.ToLower().Contains(text.ToLower()));

            if (categories == null || categories.Length <= 0) return dtos.Select(MetawordFromDto).ToList();
            var byCategories = _repository.GetMetawordsIdsByCategories(categories);
            dtos = dtos.Where(q => byCategories.Contains(q.Id));

            return dtos.Select(MetawordFromDto).ToList();

        }


        public IEnumerable<Word> GetWords(int languageId, int wordtype, string word)
        {
            var dtos = _repository.GetWords(languageId, wordtype, word);
            var sorters = dtos.Select(dto => WordSorterFromDto(dto, word)).ToList();
            return sorters.OrderByDescending(s => s.Match).Take(10).Select(s => s.Word).ToList();
        }

        public Word GetWord(int id)
        {
            var dto = _repository.GetWord(id);
            return WordFromDto(dto);
        }


        private static Metaword MetawordFromDto(MetawordDto dto)
        {
            return new Metaword
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


        private static WordProperty WordPropertyValueFromDto(WordPropertyDto dto)
        {
            return new WordProperty
            {
                Id = dto.Id,
                PropertyId = dto.PropertyId,
                ValueId = dto.ValueId,
                WordId = dto.WordId
            };
        }

        private static WordPropertyDto WordPropertyValueToDto(WordProperty property)
        {
            return new WordPropertyDto
            {
                Id = property.Id,
                PropertyId = property.PropertyId,
                ValueId = property.ValueId,
                WordId = property.WordId
            };
        }

        private static GrammarForm GrammarFormFromDto(GrammarFormDto dto)
        {
            return new GrammarForm
            {
                Content = dto.Content,
                CreateDate = dto.CreateDate,
                CreatorId = dto.CreatorId,
                FormId = dto.FormId,
                Id = dto.Id,
                IsActive = dto.IsActive,
                IsApproved = dto.IsApproved,
                Negative = dto.Negative,
                Positive = dto.Positive,
                WordId = dto.WordId
            };
        }

        private static GrammarFormDto GrammarFormToDto(GrammarForm form)
        {
            return new GrammarFormDto
            {
                Content = form.Content,
                CreateDate = form.CreateDate,
                CreatorId = form.CreatorId,
                FormId = form.FormId,
                Id = form.Id,
                IsActive = form.IsActive,
                IsApproved = form.IsApproved,
                Negative = form.Negative,
                Positive = form.Positive,
                WordId = form.WordId
            };
        }

        private static MetawordDto MetawordToDto(Metaword metaword)
        {
            return new MetawordDto
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
                Type = (int) metaword.Type,
                Categories = metaword.Categories == null ? null : metaword.Categories.Select(c => c.Id).ToArray(),
                Words = metaword.Words == null ? null : metaword.Words.Select(WordToDto).ToArray()
            };

        }

        private static Word WordFromDto(WordDto dto)
        {
            return new Word
            {
                CreateDate = dto.CreateDate,
                CreatorId = dto.CreatorId,
                Id = dto.Id,
                IsActive = dto.IsActive,
                IsCompleted = dto.IsCompleted,
                IsApproved = dto.IsApproved,
                LanguageId = dto.LanguageId,
                MetawordId = dto.MetawordId,
                Name = dto.Name,
                Negative = dto.Negative,
                Positive = dto.Positive,
                Weight = dto.Weight
            };
        }

        private static WordDto WordToDto(Word word)
        {
            return new WordDto
            {
                CreateDate = word.CreateDate,
                CreatorId = word.CreatorId,
                Id = word.Id,
                IsActive = word.IsActive,
                IsCompleted = word.IsCompleted,
                IsApproved = word.IsApproved,
                LanguageId = word.LanguageId,
                MetawordId = word.MetawordId,
                Name = word.Name,
                Edited = word.Edited,
                Negative = word.Negative,
                Positive = word.Positive,
                Weight = word.Weight,
                Properties = word.Properties == null ? null : word.Properties.Select(WordPropertyValueToDto).ToArray(),
                GrammarForms = word.GrammarForms == null ? null : word.GrammarForms.Select(GrammarFormToDto).ToArray()
            };
        }

        private static WordSorter WordSorterFromDto(WordDto dto, string compared)
        {
            return new WordSorter
            {
                Match = compared.CompareEnd(dto.Name),
                Word = WordFromDto(dto)
            };
        }

        private class WordSorter
        {
            public int Match { get; set; }
            public Word Word { get; set; }
        }

    }
}