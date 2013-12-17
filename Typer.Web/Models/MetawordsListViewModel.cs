using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.Web.Models {
    public class MetawordsListViewModel {

        public IEnumerable<Metaword> Metawords { get; set; }
        public PagingInfo PagingInfo { get; set; }
        public SearchModel SearchInfo { get; set; }

    }
}