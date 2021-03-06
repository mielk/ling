﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Transactions;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;

// ReSharper disable once CheckNamespace
namespace Typer.DAL.Repositories
{
    public class EFQuestionsRepository : IQuestionsRepository
    {

        private static readonly EFDbContext Context = EFDbContext.GetInstance();



        public IEnumerable<QuestionDto> GetQuestions()
        {
            return Context.Questions;
        }

        public QuestionDto GetQuestion(int id)
        {
            return Context.Questions.SingleOrDefault(q => q.Id == id);
        }

        public QuestionDto GetQuestion(string name)
        {
            return Context.Questions.SingleOrDefault(q => q.Name == name);
        }


        public IEnumerable<int> GetQuestionsIdsByCategories(IEnumerable<int> categories)
        {
            IEnumerable<QuestionCategoryDto> dtos = Context.MatchQuestionCategory.Where(q => categories.Contains(q.CategoryId));
            return dtos.Select(dto => dto.QuestionId).ToList();
        }

        public IEnumerable<VariantSetDto> GetVariantSets(int questionId)
        {
            return Context.VariantSets.Where(vs => vs.QuestionId == questionId);
        }

        public VariantSetDto GetVariantSet(int id)
        {
            return Context.VariantSets.SingleOrDefault(vs => vs.Id == id);
        }

        public IEnumerable<VariantSetDto> GetVariantSets(int questionId, int languageId)
        {
            return Context.VariantSets.Where(vs => vs.QuestionId == questionId && vs.LanguageId == languageId);
        }

        public IEnumerable<VariantSetDto> GetVariantSets(int questionId, IEnumerable<int> languagesIds)
        {
            return Context.VariantSets.Where(vs => vs.QuestionId == questionId && languagesIds.Contains(vs.LanguageId));
        }


        public IEnumerable<VariantDto> GetVariants(int variantSetId)
        {
            return Context.Variants.Where(v => v.VariantSetId == variantSetId);
        }

        public UserQueryDto GetUserQuery(int questionId, int userId, int baseLanguage, int LearnedLanguage)
        {
            return Context.UserQueries.SingleOrDefault(q => q.QuestionId == questionId && q.UserId == userId && q.BaseLanguage == baseLanguage && q.LearnedLanguage == LearnedLanguage);
        }


        public bool AddQuestion(QuestionDto question)
        {
            try
            {
                Context.Questions.Add(question);
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }



        #region Database management methods.

        public bool ClearCalculationStepsTable()
        {

            const string TableName = "TestCalculationSteps";

            string sqlCommand = string.Format(" DELETE FROM {0};", TableName);


            using (var context = EFDbContext.GetInstance())
            {

                try
                {
                    context.Database.ExecuteSqlCommand(sqlCommand);
                    return true;
                }
                catch (Exception)
                {
                    return false;
                }

            }
     
        }

        #endregion



        #region Update methods.

        public bool UpdateName(int id, string name)
        {
            var question = GetQuestion(id);
            if (question == null) return false;
            try
            {
                question.Name = name;
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool UpdateWeight(int id, int weight)
        {
            var question = GetQuestion(id);
            if (question == null) return false;
            try
            {
                question.Weight = weight;
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool UpdateCategories(QuestionDto question)
        {
            return UpdateCategories(question.Id, question.Categories);
        }

        public bool UpdateCategories(int questionId, IEnumerable<int> categories)
        {

            try
            {

                if (!DeleteCategories(questionId)) return false;

                foreach (var categoryId in categories)
                {
                    var dto = new QuestionCategoryDto
                    {
                        CategoryId = categoryId,
                        QuestionId = questionId,
                        CreatorId = 1,
                        CreateDate = DateTime.Now,
                        IsActive = true
                    };

                    Context.MatchQuestionCategory.Add(dto);
                    
                }

                Context.SaveChanges();
                return true;

            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool DeleteCategories(int questionId)
        {
            try
            {
                IEnumerable<QuestionCategoryDto> dtos = Context.MatchQuestionCategory.Where(c => c.QuestionId == questionId);
                foreach (var dto in dtos)
                {
                    Context.MatchQuestionCategory.Remove(dto);
                }
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }

        }

        public bool UpdateProperties(int id, string name, int weight)
        {
            var question = GetQuestion(id);
            if (question == null) return false;
            try
            {
                question.Name = name;
                question.Weight = weight;
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }


        public bool UpdateOptions(QuestionDto question, IEnumerable<int> languages)
        {

            IEnumerable<QuestionOptionDto> options = Context.QuestionOptions.Where(o => o.QuestionId == question.Id && languages.Contains(o.LanguageId));


            foreach (var option in options)
            {

                var updatedOption = question.Options.SingleOrDefault(o => o.Id == option.Id);

                //Check if this option is still appended. If not, remove it from the database.
                if (updatedOption == null)
                {
                    //Remove this item from the db.
                }
                else if (updatedOption.IsEdited)
                {
                    option.Content = updatedOption.Content;
                    option.CreateDate = updatedOption.CreateDate;
                    option.CreatorId = updatedOption.CreatorId;
                    option.IsActive = updatedOption.IsActive;
                    option.IsApproved = updatedOption.IsApproved;
                    option.IsCompleted = updatedOption.IsCompleted;
                    option.IsComplex = updatedOption.IsComplex;
                    option.IsMain = updatedOption.IsMain;
                    option.LanguageId = updatedOption.LanguageId;
                    option.Negative = updatedOption.Negative;
                    option.Positive = updatedOption.Positive;
                    option.QuestionId = updatedOption.QuestionId;
                    option.Weight = updatedOption.Weight;
                    //Context.SaveChanges();
                }

            }



            //Iterate through all the options in updated DTO object and add new items.
            foreach (var option in question.Options)
            {
                if (option.IsEdited && option.Id == 0)
                {

                    var newOption = new QuestionOptionDto();
                    newOption.Content = option.Content;
                    newOption.CreateDate = option.CreateDate;
                    newOption.CreatorId = option.CreatorId;
                    newOption.IsActive = true;
                    newOption.IsApproved = option.IsApproved;
                    newOption.IsCompleted = option.IsCompleted;
                    newOption.IsComplex = option.IsComplex;
                    newOption.IsMain = option.IsMain;
                    newOption.LanguageId = option.LanguageId;
                    newOption.Negative = option.Negative;
                    newOption.Positive = option.Positive;
                    newOption.QuestionId = option.QuestionId;
                    newOption.Weight = option.Weight;

                    Context.QuestionOptions.Add(newOption);

                }
            }


            return true;

        }


        public bool Update(QuestionDto question, IEnumerable<int> languages)
        {

            var correct = true;
            var entity = GetQuestion(question.Id);

            using (var scope = new TransactionScope())
            {

                try
                {
                    entity.Name = question.Name;
                    entity.Weight = question.Weight;
                    entity.WordType = question.WordType != null && question.WordType != 0 ? question.WordType : null;
                    entity.IsComplex = question.IsComplex;
                    entity.IsActive = question.IsActive;
                    entity.AskPlural = question.AskPlural;
                    entity.CreateDate = question.CreateDate;
                    entity.CreatorId = question.CreatorId;
                    entity.IsApproved = question.IsApproved;
                    entity.Negative = question.Negative;
                    entity.Positive = question.Positive;
                    //Context.Questions.SaveChanges();

                    //Update categories.
                    if (!UpdateCategories(question))
                    {
                        correct = false;
                    }


                    //Update options - only if [correct] is still true. Otherwise it won't be committed anyway.
                    if (correct)
                    {
                        if (!UpdateOptions(question, languages))
                        {
                            correct = false;
                        }
                    }


                }
                catch (Exception)
                {
                    scope.Dispose();
                    return false;
                }



                if (correct)
                {
                    Context.SaveChanges();
                    scope.Complete();
                    return true;
                }
                else
                {
                    scope.Dispose();
                    return false;
                }

            }


        }



        public bool UpdateQuery(int questionId, int userId, int baseLanguage, int learnedLanguage, int counter, int correct, string last50, int toDo)
        {

            var query = GetUserQuery(questionId, userId, baseLanguage, learnedLanguage);

            using (var scope = new TransactionScope())
            {

                try
                {

                    //Create new query Dto if it doesn't exist.
                    if (query == null)
                    {
                        query = new UserQueryDto
                        {
                            QuestionId = questionId,
                            UserId = userId,
                            BaseLanguage = baseLanguage,
                            LearnedLanguage = learnedLanguage,
                            Counter = counter,
                            CorrectAnswers = correct,
                            Last50 = last50,
                            ToDo = toDo,
                            LastQuery = DateTime.Now
                        };

                        Context.UserQueries.Add(query);
                        Context.SaveChanges();

                    }
                    else
                    {
                        //Update properties of UserQuery object.
                        query.Counter = counter;
                        query.CorrectAnswers = correct;
                        query.Last50 = last50;
                        query.ToDo = toDo;
                        query.LastQuery = DateTime.Now;
                        Context.SaveChanges();
                    }


                }
                catch (Exception)
                {
                    scope.Dispose();
                    return false;
                }

                scope.Complete();
                return true;

            }


        }




        public bool AddToCalculationStepsTable(int questionId, double timeFactor, double doneFactor, double correctFactor,
                                               bool inherited, bool isNew, int total)
        {

            var dto = Context.TestCalculations.SingleOrDefault(tc => tc.QuestionId == questionId);
            if (dto == null)
            {
                dto = new TestCalculationDto();
                dto.QuestionId = questionId;
                dto.TimeFactor = timeFactor;
                dto.DoneFactor = doneFactor;
                dto.CorrectFactor = correctFactor;
                dto.Inherited = inherited;
                dto.IsNew = isNew;
                dto.Total = total;
            }


            if (dto.Id == 0)
            {
                Context.TestCalculations.Add(dto);
            }

            Context.SaveChanges();


            return true;


        }


        #endregion



        public bool Activate(int id)
        {
            var question = GetQuestion(id);
            if (question == null) return false;
            if (question.IsActive)
                return true;

            try
            {
                question.IsActive = true;
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool Deactivate(int id)
        {
            var question = GetQuestion(id);
            if (question == null) return false;
            if (!question.IsActive)
                return false;

            try
            {
                question.IsActive = false;
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }


        public bool NameExists(string name)
        {
            var counter = Context.Questions.Count(q => q.Name == name);
            return (counter > 0);
        }


        public bool NameExists(int id, string name)
        {
            var counter = Context.Questions.Count(q => q.Id == id && q.Name == name);
            return (counter > 0);
        }



        public IEnumerable<QuestionOptionDto> GetOptions(int questionId)
        {
            return Context.QuestionOptions.Where(o => o.QuestionId == questionId && o.IsActive);
        }


        public IEnumerable<QuestionOptionDto> GetOptions(int questionId, IEnumerable<int> languages)
        {
            return Context.QuestionOptions.Where(o => o.QuestionId == questionId && o.IsActive && languages.Contains(o.LanguageId));
        }

        public QuestionOptionDto GetOption(int optionId)
        {
            return Context.QuestionOptions.SingleOrDefault(o => o.Id == optionId);
        }

        public IEnumerable<QuestionCategoryDto> GetCategories(int questionId)
        {
            return Context.MatchQuestionCategory.Where(m => m.QuestionId == questionId);
        }

        public VariantDto GetVariant(int variantId)
        {
            return Context.Variants.SingleOrDefault(v => v.Id == variantId);
        }

        public IEnumerable<VariantDto> GetVariantsForQuestion(int questionId, IEnumerable<int> languages)
        {

            var sets = Context.VariantSets.Where(vs => vs.QuestionId == questionId && languages.Contains(vs.LanguageId)).Select(vs => vs.Id);
            return Context.Variants.Where(vs => sets.Contains(vs.VariantSetId));

        }

        public IEnumerable<VariantConnectionDto> GetVariantSetsConnections(int questionId, IEnumerable<int> languages)
        {
            var sets = Context.VariantSets.Where(vs => vs.QuestionId == questionId && languages.Contains(vs.LanguageId)).Select(vs => vs.Id);
            return Context.VariantConnections.Where(vc => sets.Contains(vc.VariantSetId) && sets.Contains(vc.ConnectedSetId));
        }

        public IEnumerable<VariantConnectionDto> GetVariantSetsConnections(IEnumerable<int> sets)
        {
            var setsArray = sets.ToArray();
            return Context.VariantConnections.Where(vc => setsArray.Contains(vc.VariantSetId) && setsArray.Contains(vc.ConnectedSetId));
        }


        public IEnumerable<VariantDependencyDto> GetVariantSetsDependencies(int questionId, IEnumerable<int> languages)
        {
            var sets = Context.VariantSets.Where(vs => vs.QuestionId == questionId && languages.Contains(vs.LanguageId)).Select(vs => vs.Id);
            return Context.VariantDependencies.Where(vd => sets.Contains(vd.MainSetId) || sets.Contains(vd.DependantSetId));
        }

        public IEnumerable<VariantDependencyDto> GetVariantSetsDependencies(IEnumerable<int> sets)
        {
            var setsArray = sets.ToArray();
            return Context.VariantDependencies.Where(vd => setsArray.Contains(vd.MainSetId) || setsArray.Contains(vd.DependantSetId));
        }

        public IEnumerable<VariantLimitDto> GetVariantSetsLimits(int questionId, IEnumerable<int> languages)
        {
            var sets = Context.VariantSets.Where(vs => vs.QuestionId == questionId && languages.Contains(vs.LanguageId)).Select(vs => vs.Id);
            var limits = Context.VariantLimits.Where(vl => vl.QuestionId == questionId);
            return limits.Where(vl => sets.Contains(vl.ConnectedVariantId) || sets.Contains(vl.VariantId));
        }

        public IEnumerable<VariantLimitDto> GetVariantSetsLimits(IEnumerable<int> sets)
        {
            var setsArray = sets.ToArray();
            return Context.VariantLimits.Where(vl => setsArray.Contains(vl.ConnectedVariantId) || setsArray.Contains(vl.VariantId));
        }

        public IEnumerable<VariantDto> GetVariants(int questionId, IEnumerable<int> languages)
        {
            var sets = Context.VariantSets.Where(vs => vs.QuestionId == questionId && languages.Contains(vs.LanguageId)).Select(vs => vs.Id);
            return Context.Variants.Where(v => sets.Contains(v.VariantSetId));
        }

        public IEnumerable<VariantDto> GetVariants(IEnumerable<int> sets)
        {
            return Context.Variants.Where(v => sets.Contains(v.VariantSetId));
        }

        public IEnumerable<MatchVariantWordDto> GetVariantWordMatching(IEnumerable<int> variants)
        {
            return Context.MatchVariantWords.Where(mvw => variants.Contains(mvw.VariantId));
        }

        public IEnumerable<UserQueryDto> GetUserQueries(int userId, int baseLanguage, int learnedLanguage)
        {
            return Context.UserQueries.Where(uq => uq.UserId == userId && uq.BaseLanguage == baseLanguage && uq.LearnedLanguage == learnedLanguage);
        }


        //Test sessions.
        public int RegisterSession(int userId, int baseLanguage, int learnedLanguage)
        {
            var sessionDto = new TestSessionDto();
            sessionDto.UserId = userId;
            sessionDto.BaseLanguage = baseLanguage;
            sessionDto.LearnedLanguage = learnedLanguage;
            sessionDto.StartTime = DateTime.Now;
            sessionDto.EndTime = DateTime.Now;
            sessionDto.Completed = false;

            Context.TestSessions.Add(sessionDto);
            Context.SaveChanges();

            return sessionDto.Id;

        }


        public bool SaveSessionStats(int sessionId, int queries, int correct, int questions, int bestRow, bool completed)
        {

            var session = Context.TestSessions.SingleOrDefault(s => s.Id == sessionId);


            //Check if Session has been found.
            if (session == null) return false;


            using (var scope = new TransactionScope())
            {

                try
                {

                    //Update properties of TestSession object.
                    session.EndTime = DateTime.Now;
                    session.Queries = queries;
                    session.Correct = correct;
                    session.Wrong = queries - correct;
                    session.Questions = questions;
                    session.BestRow = bestRow;
                    session.Completed = completed;
                    Context.SaveChanges();

                }
                catch (Exception)
                {
                    scope.Dispose();
                    return false;
                }

                scope.Complete();
                return true;

            }

        }

    }
}