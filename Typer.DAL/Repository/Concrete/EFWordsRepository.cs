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

        public bool Update(int id, string name, int wordtype, int weight, int[] categories)
        {

            using (TransactionScope scope = new TransactionScope())
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

        public IEnumerable<WordCategoryDto> GetCategories(int metawordId)
        {
            return Context.MatchWordCategory.Where(m => m.MetawordId == metawordId);
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

        public IEnumerable<WordDto> GetWords(int metawordId, int[] languages)
        {
            return Context.Words.Where(o => o.MetawordId == metawordId && o.IsActive && languages.Contains(o.LanguageId));
        }


    }
}