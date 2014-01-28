using System;
using System.Collections.Generic;
using System.Linq;
using System.Transactions;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;

// ReSharper disable once CheckNamespace
namespace Typer.DAL.Repositories
{
    public class EfWordsRepository : IWordsRepository
    {

        private static readonly EFDbContext Context = EFDbContext.GetInstance();



        public IEnumerable<MetawordDto> GetMetawords()
        {
            return Context.Metawords;
        }

        public MetawordDto GetMetaword(int id)
        {
            return Context.Metawords.SingleOrDefault(q => q.Id == id);
        }

        public MetawordDto GetMetaword(string name)
        {
            return Context.Metawords.SingleOrDefault(q => q.Name == name);
        }


        public IEnumerable<int> GetMetawordsIdsByCategories(int[] categories)
        {
            IEnumerable<WordCategoryDto> dtos = Context.MatchWordCategory.Where(q => categories.Contains(q.CategoryId));
            return dtos.Select(dto => dto.MetawordId).ToList();
        }


        public bool AddMetaword(MetawordDto metaword)
        {
            try
            {
                Context.Metawords.Add(metaword);
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
            var metaword = GetMetaword(id);
            if (metaword != null)
            {
                try
                {
                    metaword.Name = name;
                    Context.SaveChanges();
                    return true;
                }
                catch (Exception)
                {
                    return false;
                }
            }

            return false;
        }

        public bool UpdateWeight(int id, int weight)
        {
            var metaword = GetMetaword(id);
            if (metaword != null)
            {
                try
                {
                    metaword.Weight = weight;
                    Context.SaveChanges();
                    return true;
                }
                catch (Exception)
                {
                    return false;
                }
            }

            return false;

        }

        public bool UpdateProperties(int id, string name, int weight)
        {
            var metaword = GetMetaword(id);
            if (metaword != null)
            {
                try
                {
                    metaword.Name = name;
                    metaword.Weight = weight;
                    Context.SaveChanges();
                    return true;
                }
                catch (Exception)
                {
                    return false;
                }
            }

            return false;
        }
        
        #endregion




        public bool UpdateCategories(int wordId, int[] categories){

            try{

                if (!DeleteCategories(wordId)) return false;

                foreach (var categoryId in categories)
                {
                    var dto = new WordCategoryDto
                    {
                        CategoryId = categoryId,
                        MetawordId = wordId,
                        CreatorId = 1,
                        CreateDate = DateTime.Now,
                        IsActive = true
                    };

                    Context.MatchWordCategory.Add(dto);
                    
                }

                Context.SaveChanges();
                return true;

            } catch (Exception){
                return false;
            }
        }

        public bool DeleteCategories(int wordId)
        {
            try
            {
                IEnumerable<WordCategoryDto> dtos = Context.MatchWordCategory.Where(c => c.MetawordId == wordId);
                foreach (var dto in dtos)
                {
                    Context.MatchWordCategory.Remove(dto);
                }
                Context.SaveChanges();
                return true;
            }
            catch (Exception)
            {
                return false;
            }

        }

        public bool Update(int id, string name, int wordtype, int weight, int[] categories, int[] removed, 
            string[] edited, string[] added, string[] properties, string[] forms)
        {

            bool completed = false;
            using (var scope = new TransactionScope())
            {
                var result = true;
                var metaword = GetMetaword(id);
                if (metaword != null)
                {
                    try
                    {
                        if (name.Length > 0) metaword.Name = name;
                        if (weight > 0) metaword.Weight = weight;
                        if (wordtype > 0) metaword.Type = wordtype;
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
                                var word = GetWord(_id);
                                if (word != null)
                                {
                                    word.IsActive = false;
                                }
                                else
                                {
                                    result = false;
                                }
                            }
                        }


                        //Edited
                        if (edited != null)
                        {
                            for (var i = 0; i < edited.Length; i++)
                            {
                                var s = edited[i];
                                if (!UpdateWord(s)) result = false;
                            }
                        }


                        //Added
                        if (added != null)
                        {
                            for (var i = 0; i < added.Length; i++)
                            {
                                var s = added[i];
                                if (!AddOption(s, id)) result = false;
                            }
                        }

                        //Properties
                        if (properties != null)
                        {
                            for (var i = 0; i < properties.Length; i++)
                            {
                                var s = properties[i];
                                if (!AddWordProperty(s)) result = false;
                            }
                        }

                        //Forms
                        if (forms != null)
                        {
                            for (var i = 0; i < forms.Length; i++)
                            {
                                var s = forms[i];
                                if (!AddGrammarForm(s)) result = false;
                            }
                        }


                        if (result)
                        {
                            Context.SaveChanges();
                            scope.Complete();
                            completed = true;
                            return true;
                        }

                    }
                    catch (Exception)
                    {

                    }
                    finally
                    {
                        if (!completed)
                        {
                            scope.Dispose();
                        }
                    }
                }

                
                return false;

            }

        }


        private bool UpdateWord(string s)
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

            //Complete.
            bool complete;
            Boolean.TryParse(parameters[3], out complete);

            var option = GetWord(id);
            if (option == null) return false;
            option.Name = name;
            option.Weight = weight;
            option.GrammarCompleted = complete;

            return true;

        }


        private bool AddWordProperty(string s)
        {
            var parameters = s.Split('|');

            //Word Id.
            int wordId;
            Int32.TryParse(parameters[0], out wordId);

            //Property Id.
            int propertyId;
            Int32.TryParse(parameters[1], out propertyId);

            //Value
            int value;
            Int32.TryParse(parameters[2], out value);

            return AddWordProperty(wordId, propertyId, value);

        }

        private bool AddWordProperty(int id, string s)
        {
            var parameters = s.Split('|');

            //Word Id.
            int wordId = id;

            //Property Id.
            int propertyId;
            Int32.TryParse(parameters[1], out propertyId);

            //Value
            int value;
            Int32.TryParse(parameters[2], out value);

            return AddWordProperty(wordId, propertyId, value);
        }

        private bool AddWordProperty(int wordId, int propertyId, int value)
        {
            //Dto object.
            WordtypePropertyValueDto dto = GetPropertyValue(wordId, propertyId);
            if (dto != null)
            {
                dto.Value = value;
            }
            else
            {
                dto = new WordtypePropertyValueDto
                {
                    PropertyId = propertyId,
                    WordId = wordId,
                    Value = value
                };
                Context.WordtypePropertyValues.Add(dto);
            }

            return true;
        }

        private bool AddGrammarForm(string s)
        {
            var parameters = s.Split('|');

            //Word Id.
            int wordId;
            Int32.TryParse(parameters[0], out wordId);

            //Property Id.
            int formId;
            Int32.TryParse(parameters[1], out formId);

            //Value
            string value = parameters[2];

            return AddGrammarForm(wordId, formId, value);

        }

        private bool AddGrammarForm(int wordId, string s)
        {
            var parameters = s.Split('|');

            //Property Id.
            int formId;
            Int32.TryParse(parameters[1], out formId);

            //Value
            string value = parameters[2];

            return AddGrammarForm(wordId, formId, value);
        }

        private bool AddGrammarForm(int wordId, int formId, string value)
        {

            //Dto object.
            GrammarFormDto dto = GetGrammarForm(wordId, formId);
            if (dto != null)
            {
                if (value.Length == 0)
                {
                    Context.GrammarForms.Remove(dto);
                }
                else
                {
                    dto.Content = value;
                }
            }
            else
            {
                dto = new GrammarFormDto
                {
                    WordId = wordId,
                    Content = value,
                    FormId = formId,
                    CreatorId = 1,
                    CreateDate = DateTime.Now,
                    IsActive = true
                };
                Context.GrammarForms.Add(dto);
            }

            return true;

        }


        private bool AddOption(string s, int id)
        {

            string[] paramGroups = s.Split('$');
            
            int idWord = AddOptionMetaData(paramGroups[0], id);

            if (idWord == 0) return false;

            if (!AddNewWordProperties(paramGroups[1], idWord)) return false;

            if (!AddNewWordGrammarForms(paramGroups[2], idWord)) return false;

            return true;

        }

        private static int AddOptionMetaData(string s, int id)
        {
            var parameters = s.Split('|');

            //Language Id.
            int languageId;
            Int32.TryParse(parameters[0], out languageId);

            //Name.
            var name = parameters[1];

            //Weight.
            int weight;
            Int32.TryParse(parameters[2], out weight);

            //Completed
            bool completed;
            Boolean.TryParse(parameters[3], out completed);


            var word = new WordDto
            {
                Name = name,
                Weight = weight,
                CreateDate = DateTime.Now,
                CreatorId = 1,
                GrammarCompleted = completed,
                IsActive = true,
                Negative = 0,
                Positive = 0,
                IsApproved = false,
                MetawordId = id,
                LanguageId = languageId
            };

            Context.Words.Add(word);
            Context.SaveChanges();

            return word.Id;
        }

        private bool AddNewWordProperties(string s, int id){
            var properties = s.Split(';');
            var result = true;

            foreach (var property in properties)
            {
                if (property.Length > 0)
                {
                    var parameters = property.Split('|');
                    int key;
                    Int32.TryParse(parameters[0], out key);
                    int value;
                    Int32.TryParse(parameters[1], out value);

                    if (!AddWordProperty(id, key, value)) result = false;

                }
            }

            return result;

        }

        private bool AddNewWordGrammarForms(string s, int id){
            var forms = s.Split(';');
            var result = true;

            foreach (var form in forms)
            {
                if (form.Length > 0)
                {
                    var parameters = form.Split('|');
                    int formId;
                    Int32.TryParse(parameters[0], out formId);
                    var value = parameters[1];

                    if (!AddGrammarForm(id, formId, value)) result = false;

                }
            }

            return result;

        }







        public IEnumerable<WordCategoryDto> GetCategories(int metawordId)
        {
            return Context.MatchWordCategory.Where(m => m.MetawordId == metawordId);
        }

        public IEnumerable<GrammarPropertyDefinitionDto> GetProperties(IEnumerable<int> ids)
        {
            return Context.GrammarPropertyDefinitions.Where(gpd => ids.Contains(gpd.Id));
        }

        public IEnumerable<GrammarPropertyOptionDto> GetGrammarPropertyOptions(int propertyId)
        {
            return Context.GrammarPropertyOptions.Where(gpo => gpo.PropertyId == propertyId);
        }

        public IEnumerable<int> GetPropertiesIds(int languageId, int wordtypeId)
        {
            return Context.WordPropertyDefinitions.
                Where(wp => wp.LanguageId == languageId && wp.WordtypeId == wordtypeId).
                Select(wp => wp.PropertyId).ToList();
        }

        public IEnumerable<GrammarFormDefinitonDto> GetGrammarDefinitions(int languageId, int wordtypeId)
        {
            return Context.GrammarDefinitions.Where(gd => gd.LanguageId == languageId && gd.WordtypeId == wordtypeId);
        }

        public IEnumerable<GrammarFormDto> GetGrammarForms(int wordId)
        {
            return Context.GrammarForms.Where(gf => gf.WordId == wordId && gf.IsActive);
        }

        public IEnumerable<WordtypePropertyValueDto> GetPropertyValues(int wordId)
        {
            return Context.WordtypePropertyValues.Where(wpv => wpv.WordId == wordId);
        }

        public WordtypePropertyValueDto GetPropertyValue(int wordId, int propertyId)
        {
            return Context.WordtypePropertyValues.SingleOrDefault(wpv => wpv.WordId == wordId && wpv.PropertyId == propertyId);
        }

        public GrammarFormDto GetGrammarForm(int wordId, int formId)
        {
            return Context.GrammarForms.SingleOrDefault(gf => gf.WordId == wordId && gf.FormId == formId);
        }



        public bool Activate(int id)
        {
            var metaword = GetMetaword(id);
            if (metaword == null) return false;
            if (metaword.IsActive)
                return true;

            try
            {
                metaword.IsActive = true;
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
            var metaword = GetMetaword(id);
            if (metaword == null) return false;
            if (!metaword.IsActive)
                return false;

            try
            {
                metaword.IsActive = false;
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
            var counter = Context.Metawords.Count(q => q.Name == name);
            return (counter > 0);
        }


        public bool NameExists(int id, string name)
        {
            var counter = Context.Metawords.Count(q => q.Id == id && q.Name == name);
            return (counter > 0);
        }



        public IEnumerable<WordDto> GetWords(int metawordId)
        {
            return Context.Words.Where(o => o.MetawordId == metawordId && o.IsActive);
        }

        public WordDto GetWord(int wordId)
        {
            return Context.Words.SingleOrDefault(w => w.Id == wordId);
        }

        public IEnumerable<WordDto> GetWords(int metawordId, int[] languages)
        {
            return Context.Words.Where(o => o.MetawordId == metawordId && o.IsActive && languages.Contains(o.LanguageId));
        }

        public IEnumerable<WordDto> GetWords(int languageId, int wordtype, string word)
        {
            return Context.Words.Where(w => w.LanguageId == languageId && w.Name.EndsWith(word.Substring(word.Length - 2)) && !w.Name.Equals(word));
        }

        public int AddMetaword(string name, int wordtype, int weight, int[] categories, string[] options, string[] properties, string[] forms)
        {

            var completed = false;
            using (var scope = new TransactionScope())
            {
                var result = true;
                var metaword = new MetawordDto
                {
                    CreateDate = DateTime.Now,
                    CreatorId = 1,
                    Name = name,
                    Type = wordtype,
                    Weight = weight,
                    IsActive = true
                };

                Context.Metawords.Add(metaword);
                Context.SaveChanges();
                var id = metaword.Id;

                if (id > 0)
                {

                    try{

                        result = UpdateCategories(id, categories);


                        //Added
                        if (options != null)
                        {
                            for (var i = 0; i < options.Length; i++)
                            {
                                var s = options[i];
                                var _result = AddOption(s, id);
                                if (!_result) result = false;
                            }
                        }


                        //Properties
                        if (properties != null)
                        {
                            for (var i = 0; i < properties.Length; i++)
                            {
                                var s = properties[i];
                                if (!AddWordProperty(id, s)) result = false;
                            }
                        }

                        //Forms
                        if (forms != null)
                        {
                            for (var i = 0; i < forms.Length; i++)
                            {
                                var s = forms[i];
                                if (!AddGrammarForm(id, s)) result = false;
                            }
                        }

                        if (result)
                        {
                            Context.SaveChanges();
                            scope.Complete();
                            completed = true;
                            return id;
                        }

                    }
                    catch (Exception)
                    {

                    }
                    finally
                    {
                        if (!completed)
                        {
                            scope.Dispose();
                        }
                    }

                }

                return 0;

                }
   
            }

    }
}