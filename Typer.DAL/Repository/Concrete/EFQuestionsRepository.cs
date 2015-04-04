using System;
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


        public bool Update(QuestionDto question)
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
                    Context.SaveChanges();

                    //Update categories.

                    //Update options.


                }
                catch (Exception)
                {
                    scope.Dispose();
                    return false;
                }



                if (correct)
                {
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

    }
}