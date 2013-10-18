using Typer.Domain.Entities;
using System.Data.Entity;
using Typer.DAL.TransferObjects;

namespace Typer.DAL.Infrastructure
{
    public class EFDbContext : DbContext
    {

        private static EFDbContext instance;

        public DbSet<User> Users { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Language> Languages { get; set; }
        public DbSet<LanguageUserDto> UserLanguages { get; set; }


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