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
        private static readonly Dictionary<int, Dictionary<int, IEnumerable<GrammarPropertyDefinition>>> WordPropertiesMap =
            new Dictionary<int, Dictionary<int, IEnumerable<GrammarPropertyDefinition>>>();

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
            return _repository.UpdateProperties(metaword.Id, metaword.Name, metaword.Weight);
        }

        public bool AddMetaword(Metaword metaword)
        {
            var dto = MetawordToDto(metaword);
            return _repository.AddMetaword(dto);
        }

        public int AddMetaword(string name, int wordtype, int weight, int[] categories, string[] options, string[] properties, string[] forms)
        {
            return _repository.AddMetaword(name, wordtype, weight, categories, options, properties, forms);
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

        public bool Update(int id, string name, int wordtype, int weight, int[] categories, int[] removed,
                    string[] edited, string[] added, string[] properties, string[] forms)
        {
            return _repository.Update(id, name, wordtype, weight, categories, removed, edited, added, properties, forms);
        }

        public IEnumerable<Category> GetCategories(int metawordId)
        {
            var dtos = _repository.GetCategories(metawordId);
            return dtos.Select(dto => _categoryService.GetCategory(dto.CategoryId)).ToList();
        }

        public IEnumerable<GrammarPropertyDefinition> GetProperties(int languageId, int wordtypeId)
        {

            //First it is trying to find properties for the given pair language-wordtype in the flyweight map.
            Dictionary<int, IEnumerable<GrammarPropertyDefinition>> submap;
            if (!WordPropertiesMap.TryGetValue(languageId, out submap))
            {
                submap = new Dictionary<int, IEnumerable<GrammarPropertyDefinition>>();
                WordPropertiesMap.Add(languageId, submap);
            };

            IEnumerable<GrammarPropertyDefinition> propertiesFromMap;
            if (submap.TryGetValue(wordtypeId, out propertiesFromMap))
            {
                //Properties have been already loaded.
                return propertiesFromMap;
            }

            var propertiesIds = _repository.GetPropertiesIds(languageId, wordtypeId);
            var properties = _repository.GetProperties(propertiesIds).Select(GrammarPropertyDefinitionFromDto);
            submap.Add(wordtypeId, properties);
            return properties;

        }

        public IEnumerable<GrammarFormDefinition> GetGrammarFormDefinitions(int languageId, int wordtypeId)
        {
            var dtos = _repository.GetGrammarDefinitions(languageId, wordtypeId);
            return dtos.Select(GrammarFormDefinitionFromDto).ToList();
        }

        public IEnumerable<WordtypePropertyValue> GetPropertyValues(int wordId)
        {
            var dtos = _repository.GetPropertyValues(wordId);
            return dtos.Select(WordtypePropertyValueFromDto).ToList();
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

        public IEnumerable<GrammarPropertyOption> GetGrammarPropertyOptions(int propertyId)
        {
            var dtos = _repository.GetGrammarPropertyOptions(propertyId);
            return dtos.Select(GrammarPropertyOptionFromDto).ToList();
        }

        public GrammarPropertyDefinition GetProperty(int id)
        {
            var dto = _repository.GetProperty(id);
            return GrammarPropertyDefinitionFromDto(dto);
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

        private static GrammarFormDefinition GrammarFormDefinitionFromDto(GrammarFormDefinitonDto dto)
        {
            return new GrammarFormDefinition
            {
                Group = dto.Group,
                Header = dto.IsHeader,
                Id = dto.Id,
                InactiveRules = dto.InactiveRules,
                Index = dto.Index,
                Key = dto.Key,
                LanguageId = dto.LanguageId,
                Name = dto.Name,
                WordtypeId = dto.WordtypeId
            };
        }

        private static WordPropertyDefinition WordtypePropertyFromDto(WordPropertyDefinitionDto definitionDto)
        {
            return new WordPropertyDefinition
            {
                Id = definitionDto.Id,
                LanguageId = definitionDto.LanguageId,
                WordtypeId = definitionDto.WordtypeId,
                PropertyId = definitionDto.PropertyId
            };
        }

        private static WordtypePropertyValue WordtypePropertyValueFromDto(WordtypePropertyValueDto dto)
        {
            return new WordtypePropertyValue
            {
                PropertyId = dto.PropertyId,
                Value = dto.Value,
                WordId = dto.WordId
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
                Type = (int) metaword.Type
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
                IsCompleted = dto.GrammarCompleted,
                IsApproved = dto.IsApproved,
                LanguageId = dto.LanguageId,
                MetawordId = dto.MetawordId,
                Name = dto.Name,
                Negative = dto.Negative,
                Positive = dto.Positive,
                Weight = dto.Weight
            };
        }

        private GrammarPropertyDefinition GrammarPropertyDefinitionFromDto(GrammarPropertyDefinitionDto dto)
        {
            var definition = new GrammarPropertyDefinition
            {
                Id = dto.Id,
                LanguageId = dto.LanguageId,
                Default = dto.Default,
                Name = dto.Name,
                Type = dto.Type,
                Options = GetGrammarPropertyOptions(dto.Id)
            };

            return definition;

        }

        private static GrammarPropertyOption GrammarPropertyOptionFromDto(GrammarPropertyOptionDto dto)
        {
            return new GrammarPropertyOption
            {
                Id = dto.Id,
                Name = dto.Name,
                PropertyId = dto.PropertyId,
                Value = dto.Value,
                Default = dto.Default
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