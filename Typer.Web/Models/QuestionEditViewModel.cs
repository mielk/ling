using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Typer.Domain.Entities;
using Typer.Domain.Services;

namespace Typer.Web.Models
{
    public class QuestionEditViewModel
    {

        private ILanguageService languageService = LanguageServicesFactory.Instance().getService();

        public Question Question { get; set; }

        public User User { get; set; }

        public IEnumerable<Language> UserLanguages { get; set; }



        public QuestionEditViewModel()
        {
        }


        public QuestionEditViewModel(Question question, User user)
        {
            Question = question;
            User = user;
            UserLanguages = getUserLanguages();
        }




        private IEnumerable<Language> getUserLanguages()
        {
            if (User != null)
            {
                return languageService.getUserLanguages(User.UserID);
            }

            return null;

        }



        public bool isValid()
        {
            if (Question != null && User != null)
                return true;

            return false;

        }



        //public List<AttendeeDto> GetMyRuns(int me)
        //{
        //    var mine = (from a in attendees
        //                join s in sample_runs 
        //                on a.sample_run_id equals s.sample_run_id
        //                where a.user_id == me
        //                orderby a.sample_run_id descending
        //                select new AttendeeDto
        //                {
        //                    SampleRunId = s.sample_run_id,
        //                    RoleName = a.role.role_name,
        //                    SampleRunStatusName = s.sample_run_status.sample_run_status_name,
        //                    ProjectNumber = s.project_number,
        //                    RunTypeName = s.run_type.run_type_name,
        //                    Description = s.description
        //                }).ToList();

        //        return mine;
        //    }
        //}



    }
}
