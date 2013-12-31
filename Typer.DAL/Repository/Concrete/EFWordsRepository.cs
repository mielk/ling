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

        public bool Update(int id, string name, int wordtype, int weight, int[] categories, int[] removed, string[] edited, string[] added)
        {

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
                        if (removed != null){
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

            var option = GetWord(id);
            if (option == null) return false;
            option.Name = name;
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

            var word = new WordDto
            {
                Name = name,
                Weight = weight,
                CreateDate = DateTime.Now,
                CreatorId = 1,
                IsActive = true,
                Negative = 0,
                Positive = 0,
                IsApproved = false,
                MetawordId = id,
                LanguageId = languageId
            };

            Context.Words.Add(word);

            return true;

        }



        public IEnumerable<WordCategoryDto> GetCategories(int metawordId)
        {
            return Context.MatchWordCategory.Where(m => m.MetawordId == metawordId);
        }

        public IEnumerable<WordtypePropertyDto> GetProperties(int languageId, int wordtypeId)
        {
            return Context.WordtypeProperties.Where(wp => wp.LanguageId == languageId && wp.WordtypeId == wordtypeId);
        }

        public IEnumerable<GrammarDefinitonDto> GetGrammarDefinitions(int languageId, int wordtypeId)
        {
            return Context.GrammarDefinitions.Where(gd => gd.LanguageId == languageId && gd.WordtypeId == wordtypeId);
        }

        public IEnumerable<WordtypePropertyValueDto> GetPropertyValues(int wordId)
        {
            return Context.WordtypePropertyValues.Where(wpv => wpv.WordId == wordId);
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

        public int AddMetaword(string name, int wordtype, int weight, int[] categories, string[] options)
        {

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

                        if (result)
                        {
                            Context.SaveChanges();
                            scope.Complete();
                            return id;
                        }

                    }
                    catch (Exception)
                    {

                    }

                }

                scope.Dispose();
                return 0;

                }
   
            }

    }
}