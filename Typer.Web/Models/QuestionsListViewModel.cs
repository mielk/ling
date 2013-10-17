using System.Collections.Generic;
using Typer.Domain.Entities;

namespace Typer.Web.Models {
    public class QuestionsListViewModel {

        public IEnumerable<Question> Questions { get; set; }
        public PagingInfo PagingInfo { get; set; }

    }
}