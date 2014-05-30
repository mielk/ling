using System;
using System.ComponentModel.DataAnnotations;


namespace Typer.DAL.TransferObjects
{
    public class WordCategoryDto
    {
        [Key]
        public int Id { get; set; }
        public int MetawordId { get; set; }
        public int CategoryId { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }
        public bool IsApproved { get; set; }
        public int Positive { get; set; }
        public int Negative { get; set; }

        public WordCategoryDto()
        {
            
        }

        public WordCategoryDto(int metawordId, int categoryId)
        {
            MetawordId = metawordId;
            CategoryId = categoryId;
            IsActive = true;
            CreatorId = 1;
            CreateDate = DateTime.Now;
            IsApproved = false;
            Positive = 0;
            Negative = 0;
        }

    }
}
