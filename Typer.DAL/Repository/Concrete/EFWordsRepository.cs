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



        public int AddMetaword(MetawordDto metaword)
        {

            using (var scope = new TransactionScope())
            {
                try
                {
                    Context.Metawords.Add(metaword);
                    Context.SaveChanges();
                    UpdateCategories(metaword.Id, metaword.Categories);
                    UpdateWords(metaword.Id, metaword.Words, 0);
                }
                catch (Exception)
                {
                    scope.Dispose();
                    return -1;
                }

                scope.Complete();
                return metaword.Id;

            }

        }



        #region Update methods.

        public bool UpdateName(int id, string name)
        {
            var metaword = GetMetaword(id);
            if (metaword == null) return false;
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

        public bool UpdateWeight(int id, int weight)
        {
            var metaword = GetMetaword(id);
            if (metaword == null) return false;
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



        public int UpdateMetaword(MetawordDto metaword, int currentUserId)
        {

            var entity = GetMetaword(metaword.Id);
            if (entity == null) return -1;

            entity.Name = metaword.Name;
            entity.Weight = metaword.Weight;
            entity.Type = metaword.Type;
            entity.IsActive = metaword.IsActive;

            using (var scope = new TransactionScope())
            {
                try
                {
                    Context.SaveChanges();
                    UpdateCategories(metaword.Id, metaword.Categories);
                    UpdateWords(metaword.Id, metaword.Words, currentUserId);
                }
                catch (Exception)
                {
                    scope.Dispose();
                    return -1;
                }
                
                scope.Complete();
                return entity.Id;

            }


        }


        private void UpdateWords(int metawordId, IEnumerable<WordDto> words, int currentUserId)
        {

            try
            {

                RemoveWordsForMetaword(metawordId, words, currentUserId);

                //Update rest of words.
                foreach (var word in words.ToArray().Where(word => word.Edited))
                {
                    if (word.Id == 0)
                    {
                        AddWord(word);
                    }
                    else
                    {
                        UpdateWord(word);
                    }
                }

            }
            catch (Exception exception)
            {
                throw new Exception(exception.ToString());
            }


        }

        public bool UpdateCategories(int metawordId, IEnumerable<int> categories)
        {
            try
            {

                //Remove previous entries.
                foreach (var category in Context.MatchWordCategory.Where(mwc => mwc.MetawordId == metawordId).ToList())
                {
                    Context.MatchWordCategory.Remove(category);
                }

                //Add new values.
                foreach (var category in categories)
                {
                    AddNewMetawordCategory(metawordId, category);
                }

                Context.SaveChanges();
                return true;

            }
            catch (Exception exception)
            {
                throw new Exception(exception.ToString());
            }
        }

        private static void AddNewMetawordCategory(int metawordId, int categoryId)
        {
            var dto = new WordCategoryDto(metawordId, categoryId);
            Context.MatchWordCategory.Add(dto);
        }

        private void RemoveWordsForMetaword(int metawordId, IEnumerable<WordDto> words, int currentUserId)
        {
            var languageRepository = new EFLanguageRepository();
            var languages = languageRepository.GetUserLanguages(currentUserId);
            var previous = GetWords(metawordId, languages);

            //Remove deleted words from the database.
            var currentWordsIds = words.Select(w => w.Id).ToList();
            foreach (var word in previous.Where(w => !currentWordsIds.Contains(w.Id)).ToList())
            {
                word.IsActive = false;
                //Context.Words.Remove(word);
                Context.SaveChanges();
            }
        }



        public bool UpdateWord(WordDto word)
        {

            var entity = Context.Words.SingleOrDefault(w => w.Id == word.Id);
            if (entity == null) return false;

            entity.MetawordId = word.MetawordId;
            entity.LanguageId = word.LanguageId;
            entity.Name = word.Name;
            entity.Weight = word.Weight;
            entity.IsActive = word.IsActive;
            entity.IsCompleted = word.IsCompleted;
            entity.IsApproved = word.IsApproved;
            entity.Positive = word.Positive;
            entity.Negative = word.Negative;

            try
            {
                Context.SaveChanges();
                UpdateWordProperties(word.Id, word.Properties);
                UpdateGrammarForms(word.Id, word.GrammarForms);
                return true;
            }
            catch (Exception exception)
            {
                throw new Exception(exception.ToString());
            }

        }

        private void UpdateWordProperties(int wordId, IEnumerable<WordPropertyDto> properties)
        {
            try
            {

                //Remove previous entries.
                foreach (var property in Context.WordPropertyValues.Where(wpv => wpv.WordId == wordId).ToList())
                {
                    Context.WordPropertyValues.Remove(property);
                }

                //Add new values.
                foreach (var property in properties)
                {
                    if (property.WordId == 0) property.WordId = wordId; //Dla nowych wyrazów.
                    Context.WordPropertyValues.Add(property);
                }

                Context.SaveChanges();

            }
            catch (Exception exception)
            {
                throw new Exception(exception.ToString());
            }
        }

        private void UpdateGrammarForms(int wordId, IEnumerable<GrammarFormDto> forms)
        {
            try
            {

                //Add new values.
                foreach (var form in forms)
                {
                    var entity = Context.GrammarForms.SingleOrDefault(gf => gf.WordId == wordId && gf.FormId == form.FormId);
                    if (entity != null)
                    {
                        entity.Content = form.Content ?? string.Empty;
                    }
                    else
                    {
                        if (form.Content != null)
                        {
                            form.WordId = wordId;
                            form.CreateDate = DateTime.Now;
                            Context.GrammarForms.Add(form);
                        }
                    }
                    
                }

                Context.SaveChanges();

            }
            catch (Exception exception)
            {
                throw new Exception(exception.ToString());
            }            
        }

        public bool AddWord(WordDto dto)
        {
            try
            {
                Context.Words.Add(dto);
                Context.SaveChanges();
                UpdateWordProperties(dto.Id, dto.Properties);
                UpdateGrammarForms(dto.Id, dto.GrammarForms);
                return true;
            }
            catch (Exception exception)
            {
                throw new Exception(exception.ToString());
            }
        }



        private bool AddOption(string s, int id)
        {

            string[] paramGroups = s.Split('$');
            
            int idWord = AddOptionMetaData(paramGroups[0], id);

            if (idWord == 0) return false;

            //if (!AddNewWordProperties(paramGroups[1], idWord)) return false;

            //if (!AddNewWordGrammarForms(paramGroups[2], idWord)) return false;

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
                IsCompleted = completed,
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




        public WordPropertyDto GetPropertyValue(int wordId, int propertyId)
        {
            return Context.WordPropertyValues.SingleOrDefault(wpv => wpv.WordId == wordId && wpv.PropertyId == propertyId);
        }


        public GrammarFormDto GetGrammarForm(int wordId, int formId)
        {
            return Context.GrammarForms.SingleOrDefault(gf => gf.WordId == wordId && gf.FormId == formId);
        }


        public IEnumerable<WordCategoryDto> GetCategories(int metawordId)
        {
            return Context.MatchWordCategory.Where(m => m.MetawordId == metawordId);
        }


        public IEnumerable<GrammarFormDto> GetGrammarForms(int definition, int[] wordsIds)
        {
            return Context.GrammarForms.Where(gf => gf.FormId == definition && wordsIds.Contains(gf.WordId));
        }

        public IEnumerable<GrammarFormDto> GetGrammarForms(int wordId)
        {
            return Context.GrammarForms.Where(gf => gf.WordId == wordId && gf.IsActive);
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



        //WORDS
        #region Word

        public WordDto GetWord(int wordId)
        {
            return Context.Words.SingleOrDefault(w => w.Id == wordId);
        }

        public IEnumerable<WordDto> GetWords(int metawordId)
        {
            return Context.Words.Where(o => o.MetawordId == metawordId && o.IsActive);
        }

        public IEnumerable<WordDto> GetWords(int metawordId, IEnumerable<int> languages)
        {
            return Context.Words.Where(o => o.MetawordId == metawordId && o.IsActive && languages.Contains(o.LanguageId));
        }

        public IEnumerable<WordPropertyDto> GetPropertyValues(int wordId)
        {
            return Context.WordPropertyValues.Where(wpv => wpv.WordId == wordId).ToList();
        }

        public IEnumerable<WordDto> GetSimilarWords(int languageId, int wordtype, string word)
        {
            return Context.Words.Where(w => w.LanguageId == languageId && w.Name.EndsWith(word.Substring(word.Length - 1)) && !w.Name.Equals(word));
        }

        #endregion Word
    }
}