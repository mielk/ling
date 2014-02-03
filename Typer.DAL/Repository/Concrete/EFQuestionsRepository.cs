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


        public IEnumerable<int> GetQuestionsIdsByCategories(int[] categories)
        {
            IEnumerable<QuestionCategoryDto> dtos = Context.MatchQuestionCategory.Where(q => categories.Contains(q.CategoryId));
            return dtos.Select(dto => dto.QuestionId).ToList();
        }

        public IEnumerable<VariantSetDto> GetVariantSets(int questionId)
        {
            return Context.VariantSets.Where(vs => vs.QuestionId == questionId);
        }

        public IEnumerable<VariantSetDto> GetVariantSets(int questionId, int languageId)
        {
            return Context.VariantSets.Where(vs => vs.QuestionId == questionId && vs.LanguageId == languageId);
        }

        public IEnumerable<VariantSetDto> GetVariantSets(int questionId, int[] languagesIds)
        {
            return Context.VariantSets.Where(vs => vs.QuestionId == questionId && languagesIds.Contains(vs.LanguageId));
        }


        public IEnumerable<VariantDto> GetVariants(int variantSetId)
        {
            return Context.Variants.Where(v => v.VariantSetId == variantSetId);
        }

        public IEnumerable<VariantConnectionDto> GetVariantConnections(int[] sets)
        {
            return Context.VariantConnections.Where(vc => sets.Contains(vc.VariantSetId) && sets.Contains(vc.ConnectedSetId));
        }

        public IEnumerable<VariantLimitDto> GetVariantLimits(int questionId)
        {
            return Context.VariantLimits.Where(vc => vc.QuestionId == questionId);
        }

        public IEnumerable<VariantDependencyDto> GetVariantDependencies(int[] sets)
        {
            return Context.VariantDependencies.Where(vd => sets.Contains(vd.MainSetId) && sets.Contains(vd.DependantSetId));
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


        public bool UpdateCategories(int questionId, int[] categories)
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
        
        #endregion


        public bool Update(int id, string name, int weight, int[] categories, int[] removed, string[] edited, string[] added)
        {

            using (var scope = new TransactionScope())
            {
                var result = true;
                var question = GetQuestion(id);
                if (question != null)
                {
                    try
                    {
                        if (name.Length > 0) question.Name = name;
                        if (weight > 0) question.Weight = weight;
                        if (categories != null)
                        {
                            result = UpdateCategories(id, categories);
                        }




                        //Removed
                        if (removed != null)
                        {
                            for (var i = 0; i < removed.Length; i++)
                            {
                                var _id = removed[i];
                                var option = GetOption(_id);
                                if (option == null)
                                {
                                    result = false;
                                }
                                else
                                {
                                    option.IsActive = false;    
                                }
                                
                            }
                        }


                        //Edited
                        if (edited != null)
                        {
                            for (var i = 0; i < edited.Length; i++)
                            {
                                var s = edited[i];
                                var _result = UpdateOption(s);
                                if (!_result) result = false;
                            }
                        }

                        //Added
                        if (added != null)
                        {
                            for (var i = 0; i < added.Length; i++)
                            {
                                var s = added[i];
                                var _result = AddOption(s, id);
                                if (!_result) result = false;
                            }
                        }



                        if (result)
                        {
                            Context.SaveChanges();
                            scope.Complete();
                            return true;
                        }

                    }
                    catch (Exception)
                    {

                    }
                }

                scope.Dispose();
                return false;

            }

        }





        private bool UpdateOption(string s)
        {
            string[] parameters = s.Split('|');

            //Id.
            int id;
            Int32.TryParse(parameters[0], out id);

            //Name.
            var name = parameters[1];

            //Weight.
            int weight;
            Int32.TryParse(parameters[2], out weight);

            var option = GetOption(id);
            if (option == null) return false;
            option.Content = name;
            option.Weight = weight;

            return true;

        }

        private bool AddOption(string s, int id)
        {
            string[] parameters = s.Split('|');

            //Language Id.
            int languageId;
            Int32.TryParse(parameters[0], out languageId);

            //Name.
            var name = parameters[1];

            //Weight.
            int weight;
            Int32.TryParse(parameters[2], out weight);

            var option = new QuestionOptionDto
            {
                Content = name,
                Weight = weight,
                CreateDate = DateTime.Now,
                CreatorId = 1,
                IsActive = true,
                Negative = 0,
                Positive = 0,
                IsApproved = false,
                QuestionId = id,
                LanguageId = languageId
            };

            Context.QuestionOptions.Add(option);

            return true;

        }



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


        public IEnumerable<QuestionOptionDto> GetOptions(int questionId, int[] languages)
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

        public IEnumerable<DependencyDefinitionDto> GetDependenciesDefinitions(int[] languages)
        {
            return Context.DependenciesDefinitions.Where(dd => languages.Contains(dd.LanguageId));
        }

        public IEnumerable<VariantSetPropertyValueDto> GetVariantSetPropertiesValues(int id)
        {
            return Context.VariantSetPropertyValues.Where(vspv => vspv.VariantSetId == id);
        }

        public IEnumerable<VariantSetPropertyDefinitionDto> GetVariantSetPropertiesDefinitions(int wordtypeId, int languageId)
        {
            return
                Context.VariantSetPropertyDefinitions.Where(
                    vspd => vspd.LanguageId == languageId && vspd.WordtypeId == wordtypeId);
        }
    }
}