using System;
using System.Collections.Generic;
using System.Linq;
using System.Transactions;
using Ninject.Infrastructure.Language;
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


        public bool Update(int id, string name, int weight, int[] categories,
                string[] dependencies, string[] connections, string[] editedSets)
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

                        //Variant sets changes
                        if (editedSets != null)
                        {
                            foreach (string edited in editedSets)
                            {
                                if (!UpdateVariantSet(edited))
                                {
                                    result = false;
                                }
                            }
                        }

                        //Variant sets dependencies
                        if (dependencies != null)
                        {
                            foreach (string dependency in dependencies)
                            {
                                if (!UpdateDependencies(dependency))
                                {
                                    result = false;
                                }
                            }
                        }

                        //Variant sets connections
                        if (connections != null)
                        {

                            foreach (string connection in connections)
                            {
                                if (!UpdateConnections(connection))
                                {
                                    result = false;
                                }                                
                            }
                        }
                        


                        ////Removed
                        //if (removed != null)
                        //{
                        //    for (var i = 0; i < removed.Length; i++)
                        //    {
                        //        var _id = removed[i];
                        //        var option = GetOption(_id);
                        //        if (option == null)
                        //        {
                        //            result = false;
                        //        }
                        //        else
                        //        {
                        //            option.IsActive = false;    
                        //        }
                                
                        //    }
                        //}


                        ////Edited
                        //if (edited != null)
                        //{
                        //    for (var i = 0; i < edited.Length; i++)
                        //    {
                        //        var s = edited[i];
                        //        var _result = UpdateOption(s);
                        //        if (!_result) result = false;
                        //    }
                        //}

                        ////Added
                        //if (added != null)
                        //{
                        //    for (var i = 0; i < added.Length; i++)
                        //    {
                        //        var s = added[i];
                        //        var _result = AddOption(s, id);
                        //        if (!_result) result = false;
                        //    }
                        //}



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



        private bool UpdateVariantSet(string s)
        {

            string[] parameters = s.Split('|');

            //Set id
            int id;
            Int32.TryParse(parameters[0], out id);

            //Property id
            int propertyId;
            Int32.TryParse(parameters[1], out propertyId);

            //Value
            int value;
            Int32.TryParse(parameters[2], out value);

            var property = GetVariantSetPropertyValue(id, propertyId);
            if (property == null)
            {
                property = new VariantSetPropertyValueDto
                {
                    PropertyId = propertyId,
                    Value = value,
                    VariantSetId = id
                };

                Context.VariantSetPropertyValues.Add(property);

            }
            else
            {
                property.Value = value;
            }
            
            return true;

        }

        private bool UpdateDependencies(string s)
        {

            string[] parameters = s.Split('|');

            //action
            int action;
            Int32.TryParse(parameters[0], out action);

            //parent
            int parentId;
            Int32.TryParse(parameters[1], out parentId);
            
            //dependant
            int dependantId;
            Int32.TryParse(parameters[2], out dependantId);


            var dependency = GetVariantSetDependency(parentId, dependantId);
            if (dependency == null && action == 1)
            {
                dependency = new VariantDependencyDto
                {
                    MainSetId = parentId,
                    DependantSetId = dependantId,
                    IsActive = true,
                    CreatorId = 1
                };

                Context.VariantDependencies.Add(dependency);

            }
            else if (dependency != null && action == 0)
            {
                Context.VariantDependencies.Remove(dependency);
            }
            else
            {
                return false;
            }

            return true;

        }

        private bool UpdateConnections(string s)
        {

            string[] parameters = s.Split('|');

            //action
            int action;
            Int32.TryParse(parameters[0], out action);

            //parent
            int parentId;
            Int32.TryParse(parameters[1], out parentId);

            //dependant
            int connectedId;
            Int32.TryParse(parameters[2], out connectedId);


            var connection = GetVariantSetConnection(parentId, connectedId);
            if (connection == null && action == 1)
            {
                connection = new VariantConnectionDto
                {
                    VariantSetId = parentId,
                    ConnectedSetId = connectedId,
                    IsActive = true,
                    CreatorId = 1,
                    CreateDate = DateTime.Now
                };

                Context.VariantConnections.Add(connection);

            }
            else if (connection != null && action == 0)
            {
                Context.VariantConnections.Remove(connection);
            }
            else
            {
                return false;
            }

            return true;

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

        public VariantSetPropertyValueDto GetVariantSetPropertyValue(int setId, int propertyId)
        {
            return Context.VariantSetPropertyValues.SingleOrDefault(vspv => vspv.VariantSetId == setId && vspv.PropertyId == propertyId);
        }

        public VariantDependencyDto GetVariantSetDependency(int parentId, int dependantId)
        {
            return Context.VariantDependencies.SingleOrDefault(vd => vd.MainSetId == parentId && vd.DependantSetId == dependantId);
        }

        public VariantConnectionDto GetVariantSetConnection(int parentId, int connectedId)
        {
            return Context.VariantConnections.SingleOrDefault(vd => (vd.VariantSetId == parentId && vd.ConnectedSetId == connectedId) || 
                                                                    (vd.VariantSetId == connectedId && vd.ConnectedSetId == parentId));
        }

        public IEnumerable<VariantSetPropertyDefinitionDto> GetVariantSetPropertiesDefinitions(int wordtypeId, int languageId)
        {
            return
                Context.VariantSetPropertyDefinitions.Where(
                    vspd => vspd.LanguageId == languageId && vspd.WordtypeId == wordtypeId);
        }

        public IEnumerable<VariantDto> GetVariantsForVariantSet(int variantSetId)
        {
            return Context.Variants.Where(v => v.VariantSetId == variantSetId);
        }

        public IEnumerable<VariantDto> GetVariantsForQuestion(int questionId, int[] languages)
        {

            var sets = Context.VariantSets.Where(vs => vs.QuestionId == questionId && languages.Contains(vs.LanguageId)).Select(vs => vs.Id);
            return Context.Variants.Where(vs => sets.Contains(vs.VariantSetId));

        }

        public int GetGrammarDefinitionId(int variantSetId)
        {

            var wordtypeId = Context.VariantSets.Where(vs => vs.Id == variantSetId).Select(vs => vs.WordType).First();
            var properties = Context.VariantSetPropertyValues.Where(vspv => vspv.VariantSetId == variantSetId);
            var definitions = Context.GrammarDefinitions.Where(gd => gd.WordtypeId == wordtypeId).Select(gd => gd.Id);
            

            foreach (var propertyValue in properties)
            {
                var value = propertyValue;
                var numbers = definitions.ToArray();
                definitions = Context.GrammarFormDefinitionProperties.
                    Where(d => numbers.Contains(d.IdDefinition) && 
                        d.IdProperty == value.PropertyId &&
                        d.Value == value.Value).Select(d => d.IdDefinition);

            }

            var id = definitions.FirstOrDefault();
            return id;

        }
    }
}