﻿using System;
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
    public class QuestionService : IQuestionService
    {


        private readonly IQuestionsRepository repository;

        public QuestionService(IQuestionsRepository repository)
        {
            if (repository == null)
            {
                this.repository = RepositoryFactory.getQuestionsRepository();
            }
            else
            {
                this.repository = repository;
            }
        }



        public IEnumerable<Question> getQuestions()
        {
            IEnumerable<QuestionDto> dataObjects = repository.getQuestions();
            List<Question> questions = new List<Question>();

            foreach (QuestionDto dto in dataObjects)
            {
                questions.Add(questionFromDto(dto));
            }

            return questions;            

        }

        public Question getQuestion(int id)
        {
            QuestionDto dto = repository.getQuestion(id);
            return questionFromDto(dto);
        }



        public bool changeWeight(int id, int weight)
        {
            return repository.updateWeight(id, weight.ToRange(Question.MinWeight, Question.MaxWeight));
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
            QuestionDto question = repository.getQuestion(name);

            if (question != null)
            {
                return (question.Id == id ? false : true);
            }
            else
            {
                return false;
            }

        }


        public bool updateQuestion(Question question)
        {
            return repository.updateProperties(question.Id, question.Name, question.Weight);
        }

        public bool addQuestion(Question question)
        {
            QuestionDto dto = questionToDto(question);
            return repository.addQuestion(dto);
        }

        public IEnumerable<QuestionOption> getOptions(int questionId)
        {
            List<QuestionOption> options = new List<QuestionOption>();
            IEnumerable<QuestionOptionDto> dataObjects = repository.getOptions(questionId);

            foreach (QuestionOptionDto dto in dataObjects)
            {
                options.Add(optionFromDto(dto));
            }

            return options;

        }




        private Question questionFromDto(QuestionDto dto)
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

        private QuestionDto questionToDto(Question question)
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


        private QuestionOption optionFromDto(QuestionOptionDto dto)
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

        private QuestionOptionDto optionToDto(QuestionOption option)
        {
            return new QuestionOptionDto
            {
                Content = option.Content,
                CreateDate = option.CreateDate,
                CreatorId = option.CreatorId,
                Id = option.Id,
                IsActive = option.IsActive,
                IsApproved = option.IsApproved,
                IsComplex = option.IsComplex,
                LanguageId = option.LanguageId,
                Negative = option.Negative,
                Positive = option.Positive,
                QuestionId = option.QuestionId,
                Weight = option.Weight
            };
        }


    }
}