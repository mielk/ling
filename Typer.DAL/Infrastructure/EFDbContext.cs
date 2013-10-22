using System.Data.Entity;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Infrastructure
{
    public class EFDbContext : DbContext
    {

        private static EFDbContext instance;

        public DbSet<UserDto> Users { get; set; }
        public DbSet<QuestionDto> Questions { get; set; }
        public DbSet<LanguageDto> Languages { get; set; }
        public DbSet<UserLanguageDto> UserLanguages { get; set; }


        private EFDbContext()
        {
            this.Database.Initialize(false);
        }


        public static EFDbContext getInstance()
        {
            if (instance == null)
            {
                instance = new EFDbContext();
            }

            return instance;

        }

    }
}