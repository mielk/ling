using System;

namespace Typer.DAL.TransferObjects
{
    public class VariantSetDto
    {

        public int Id { get; set; }
        public int QueryId { get; set; }
        public int LanguageId { get; set; }
        public string VariantTag { get; set; }
        public int WordType { get; set; }
        public int GrammarFormId { get; set; }
        public bool IsActive { get; set; }
        public int CreatorId { get; set; }
        public DateTime CreateDate { get; set; }

    }
}