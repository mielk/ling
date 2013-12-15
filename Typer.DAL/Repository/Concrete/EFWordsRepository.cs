﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.DAL.Infrastructure;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Repositories
{
    public class EFWordsRepository : IWordsRepository
    {

        private static readonly EFDbContext context = EFDbContext.getInstance();



        public IEnumerable<MetawordDto> getMetawords()
        {
            return context.Metawords;
        }

        public MetawordDto getMetaword(int id)
        {
            return context.Metawords.SingleOrDefault(q => q.Id == id);
        }

        public MetawordDto getMetaword(string name)
        {
            return context.Metawords.SingleOrDefault(q => q.Name == name);
        }





        public bool addMetaword(MetawordDto metaword)
        {
            try
            {
                context.Metawords.Add(metaword);
                context.SaveChanges();
                return true;
            }
            catch (Exception exception)
            {
                return false;
            }
        }




        #region Update methods.

        public bool updateName(int id, string name)
        {
            MetawordDto metaword = getMetaword(id);
            if (metaword != null)
            {
                try
                {
                    metaword.Name = name;
                    context.SaveChanges();
                    return true;
                }
                catch (Exception exception)
                {
                    return false;
                }
            }

            return false;
        }

        public bool updateWeight(int id, int weight)
        {
            MetawordDto metaword = getMetaword(id);
            if (metaword != null)
            {
                try
                {
                    metaword.Weight = weight;
                    context.SaveChanges();
                    return true;
                }
                catch (Exception exception)
                {
                    return false;
                }
            }

            return false;

        }

        public bool updateProperties(int id, string name, int weight)
        {
            MetawordDto metaword = getMetaword(id);
            if (metaword != null)
            {
                try
                {
                    metaword.Name = name;
                    metaword.Weight = weight;
                    context.SaveChanges();
                    return true;
                }
                catch (Exception exception)
                {
                    return false;
                }
            }

            return false;
        }
        
        #endregion




        public bool updateCategories(int wordId, int[] categories){

            try{

                if (!deleteCategories(wordId)) return false;

                for (int i = 0; i < categories.Length; i++){
                    var categoryId = categories[i];

                    WordCategoryDto dto = new WordCategoryDto
                    {
                        CategoryId = categoryId,
                        MetawordId = wordId,
                        CreatorId = 1,
                        CreateDate = DateTime.Now,
                        IsActive = true
                    };

                    context.MatchWordCategory.Add(dto);
                    context.SaveChanges();

                }

                return true;

            } catch (Exception exception){
                return false;
            }
        }

        public bool deleteCategories(int wordId)
        {
            try
            {

                IEnumerable<WordCategoryDto> dtos = context.MatchWordCategory.Where(c => c.MetawordId == wordId);
                foreach (WordCategoryDto dto in dtos)
                {
                    context.MatchWordCategory.Remove(dto);
                }
                return true;
            }
            catch (Exception)
            {
            }

            return false;

        }


        public IEnumerable<WordCategoryDto> getCategories(int metawordId)
        {
            return context.MatchWordCategory.Where(m => m.MetawordId == metawordId);
        }


        public bool activate(int id)
        {
            MetawordDto metaword = getMetaword(id);
            if (metaword != null)
            {
                if (metaword.IsActive)
                    return true;

                try
                {
                    metaword.IsActive = true;
                    context.SaveChanges();
                    return true;
                }
                catch (Exception exception)
                {
                    return false;
                }

            }

            return false;

        }

        public bool deactivate(int id)
        {
            MetawordDto metaword = getMetaword(id);
            if (metaword != null)
            {

                if (!metaword.IsActive)
                    return false;

                try
                {
                    metaword.IsActive = false;
                    context.SaveChanges();
                    return true;
                }
                catch (Exception exception)
                {
                    return false;
                }

            }

            return false;

        }


        public bool nameExists(string name)
        {
            int counter = context.Metawords.Count(q => q.Name == name);
            return (counter > 0);
        }


        public bool nameExists(int id, string name)
        {
            int counter = context.Metawords.Count(q => q.Id == id && q.Name == name);
            return (counter > 0);
        }



        public IEnumerable<WordDto> getWords(int wordId)
        {
            return context.Words.Where(o => o.MetawordId == wordId && o.IsActive == true);
        }


    }
}