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
    public class QuestionService : IQuestionService
    {


        private readonly IQuestionsRepository _repository;
        private readonly ICategoryService _categoryService = CategoryServicesFactory.Instance().GetService();

        public QuestionService(IQuestionsRepository repository)
        {
            _repository = repository ?? RepositoryFactory.GetQuestionsRepository();
        }


        public IEnumerable<Question> GetQuestions()
        {
            var dataObjects = _repository.GetQuestions();
            return dataObjects.Select(QuestionFromDto).ToList();
        }

        public Question GetQuestion(int id)
        {
            var dto = _repository.GetQuestion(id);
            return QuestionFromDto(dto);
        }



        public bool ChangeWeight(int id, int weight)
        {
            return _repository.UpdateWeight(id, weight.ToRange(Question.MinWeight, Question.MaxWeight));
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
            var question = _repository.GetQuestion(name);

            if (question != null)
            {
                return (question.Id != id);
            }
            return false;
        }


        public bool UpdateQuestion(Question question)
        {
            return _repository.UpdateProperties(question.Id, question.Name, question.Weight);
        }


        public bool UpdateCategories(int id, int[] categoriesId)
        {
            return _repository.UpdateCategories(id, categoriesId);
        }


        public bool Update(int id, string name, int weight, int[] categories, int[] removed, string[] edited, string[] added)
        {
            return _repository.Update(id, name, weight, categories, removed, edited, added);
        }


        public bool AddQuestion(Question question)
        {
            var dto = QuestionToDto(question);
            return _repository.AddQuestion(dto);
        }

        public IEnumerable<QuestionOption> GetOptions(int questionId)
        {
            var dataObjects = _repository.GetOptions(questionId);
            return dataObjects.Select(OptionFromDto).ToList();
        }

        public IEnumerable<QuestionOption> GetOptions(int questionId, int[] languages)
        {
            var dataObjects = _repository.GetOptions(questionId, languages);
            return dataObjects.Select(OptionFromDto).ToList();
        }


        public IEnumerable<Category> GetCategories(int questionId)
        {
            var dtos = _repository.GetCategories(questionId);
            return dtos.Select(dto => _categoryService.GetCategory(dto.CategoryId)).ToList();
        }

        public IEnumerable<Question> Filter(int lowWeight, int upWeight, int[] categories, string text)
        {
            var dtos = _repository.GetQuestions();

            if (lowWeight > 0) dtos = dtos.Where(q => q.Weight >= lowWeight);
            if (upWeight > 0) dtos = dtos.Where(q => q.Weight <= upWeight);
            if (text.Length > 0) dtos = dtos.Where(q => q.Name.ToLower().Contains(text.ToLower()));
            if (categories == null || categories.Length <= 0) return dtos.Select(QuestionFromDto).ToList();
            var byCategories = _repository.GetQuestionsIdsByCategories(categories);
            dtos = dtos.Where(q => byCategories.Contains(q.Id));

            return dtos.Select(QuestionFromDto).ToList();

        }

        public IEnumerable<VariantSet> GetVariantSets(int questionId)
        {
            throw new System.NotImplementedException();
        }

        public IEnumerable<VariantSet> GetVariantSets(int questionId, int languageId)
        {
            throw new System.NotImplementedException();
        }

        public IEnumerable<VariantSet> GetVariantSets(int questionId, int[] languagesIds)
        {
            throw new System.NotImplementedException();
        }

        public IEnumerable<Variant> GetVariants(int questionId, int languageId)
        {
            throw new System.NotImplementedException();
        }

        public IEnumerable<Variant> GetVariants(int questionId, int[] languagesIds)
        {
            throw new System.NotImplementedException();
        }

        public IEnumerable<Variant> GetVariants(int variantSetId)
        {
            throw new System.NotImplementedException();
        }

        public IEnumerable<Variant> GetVariantsWithDetails(int variantSetId)
        {
            throw new System.NotImplementedException();
        }

        public IEnumerable<Variant> GetVariantsWithDetails(int questionId, int languageId)
        {
            throw new System.NotImplementedException();
        }

        public IEnumerable<Variant> GetVariantsWithDetails(int questionId, int[] languagesIds)
        {
            throw new System.NotImplementedException();
        }


        private static Question QuestionFromDto(QuestionDto dto)
        {
            return new Question
            {
                CreateDate = dto.CreateDate,
                CreatorId = dto.CreatorId,
                Id = dto.Id,
                IsActive = dto.IsActive,
                IsApproved = dto.IsApproved,
                IsComplex = dto.IsComplex,
                Name = dto.Name,
                Negative = dto.Negative,
                Positive = dto.Positive,
                Weight = dto.Weight
            };
        }

        private static QuestionDto QuestionToDto(Question question)
        {
            return new QuestionDto
            {
                CreateDate = question.CreateDate,
                CreatorId = question.CreatorId,
                Id = question.Id,
                IsActive = question.IsActive,
                IsApproved = question.IsApproved,
                IsComplex = question.IsComplex,
                Name = question.Name,
                Negative = question.Negative,
                Positive = question.Positive,
                Weight = question.Weight
            };
        }

        private static QuestionOption OptionFromDto(QuestionOptionDto dto)
        {
            return new QuestionOption
            {
                Content = dto.Content,
                CreateDate = dto.CreateDate,
                CreatorId = dto.CreatorId,
                Id = dto.Id,
                IsActive = dto.IsActive,
                IsApproved = dto.IsApproved,
                IsComplex = dto.IsComplex,
                LanguageId = dto.LanguageId,
                Negative = dto.Negative,
                Positive = dto.Positive,
                QuestionId = dto.QuestionId,
                Weight = dto.Weight
            };
        }

        private static Variant VariantFromDto(VariantDto dto)
        {
            return new Variant
            {
                Content = dto.Content,
                CreateDate = dto.CreateDate,
                CreatorId = dto.CreatorId,
                Id = dto.Id,
                IsActive = dto.IsActive,
                IsApproved = dto.IsApproved,
                Key = dto.Key,
                Negative = dto.Negative,
                Positive = dto.Positive,
                VariantSetId = dto.VariantSetId,
                WordId = dto.WordId
            };
        }

        private static VariantSet VariantSetFromDto(VariantSetDto dto)
        {
            return new VariantSet
            {
                CreateDate = dto.CreateDate,
                CreatorId = dto.CreatorId,
                Id = dto.Id,
                IsActive = dto.IsActive,
                LanguageId = dto.LanguageId,
                Params = dto.Params,
                QuestionId = dto.QuestionId,
                VariantTag = dto.VariantTag
            };
        }

    }
}